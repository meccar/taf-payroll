import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import {
  Role,
  User,
  UserClaim,
  UserLogin,
  UserToken,
} from '../../domain/entities';
import { BaseService } from './base.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { SECURITY } from '../../shared/constants/security.constants';
import { AUTH } from '../../shared/constants/auth.constants';
import {
  generateConcurrencyStamp,
  generateSecurityStamp,
} from '../../shared/utils';
import { generatePasetoToken } from '../../shared/utils/paseto.util';
import { AUTH_MESSAGES } from '../../shared/messages/auth.messages';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    super(userRepository);
  }

  async getUsers(): Promise<User[]> {
    return this.findAll();
  }

  async createUser(user: Partial<User>): Promise<User> {
    if (!user.normalizedEmail && !user.normalizedUserName)
      throw new BadRequestException(AUTH_MESSAGES.EMAIL_OR_USERNAME_REQUIRED);

    if (!user.passwordHash)
      throw new BadRequestException(AUTH_MESSAGES.PASSWORD_REQUIRED);

    let existingUser: User | null = null;

    if (user.normalizedEmail)
      existingUser = await this.findByEmail(user.normalizedEmail);

    if (!existingUser && user.normalizedUserName)
      existingUser = await this.findByUserName(user.normalizedUserName);

    if (existingUser)
      throw new BadRequestException(AUTH_MESSAGES.USER_ALREADY_EXISTS);

    user.passwordHash = await bcrypt.hash(
      user.passwordHash,
      SECURITY.BCRYPT_SALT_ROUNDS,
    );
    user.securityStamp = generateSecurityStamp();
    user.concurrencyStamp = generateConcurrencyStamp();

    const createdUser = await this.userRepository.create(user);

    return createdUser;
  }

  async login(user: Partial<User>): Promise<string> {
    if (!user.normalizedEmail && !user.normalizedUserName)
      throw new BadRequestException(AUTH_MESSAGES.EMAIL_OR_USERNAME_REQUIRED);

    if (!user.passwordHash)
      throw new BadRequestException(AUTH_MESSAGES.PASSWORD_REQUIRED);

    let existingUser: User | null = null;

    if (user.normalizedEmail)
      existingUser = await this.findByEmail(user.normalizedEmail);

    if (!existingUser && user.normalizedUserName)
      existingUser = await this.findByUserName(user.normalizedUserName);

    if (!existingUser)
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);

    if (existingUser.lockoutEnabled && existingUser.lockoutEnd) {
      const now = new Date();
      if (existingUser.lockoutEnd.getTime() > now.getTime()) {
        const remainingMinutes = Math.ceil(
          (existingUser.lockoutEnd.getTime() - now.getTime()) / 60000,
        );
        throw new UnauthorizedException(
          AUTH_MESSAGES.ACCOUNT_LOCKED(remainingMinutes),
        );
      }
    }

    const isPasswordValid = await bcrypt.compare(
      user.passwordHash,
      existingUser.passwordHash!,
    );
    if (!isPasswordValid) {
      await this.handleFailedLogin(existingUser);
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (
      existingUser.accessFailedCount !== 0 ||
      existingUser.lockoutEnd !== null
    ) {
      existingUser = await existingUser.update({
        accessFailedCount: 0,
        lockoutEnd: null,
      });
    }

    if (user.normalizedEmail && !existingUser.emailConfirmed)
      throw new UnauthorizedException(AUTH_MESSAGES.EMAIL_NOT_CONFIRMED);

    if (!existingUser.twoFactorEnabled)
      throw new UnauthorizedException(AUTH_MESSAGES.TWO_FACTOR_NOT_ENABLED);

    const payload = await this.buildPasetoPayload(existingUser);
    return generatePasetoToken(this.configService, payload);
  }

  async handleFailedLogin(user: User): Promise<void> {
    if (!user.lockoutEnabled) return;

    const updatedFailedCount = (user.accessFailedCount ?? 0) + 1;
    const maxAttempts: number = AUTH.LOCKOUT.MAX_ATTEMPTS;
    const lockoutMinutes: number = AUTH.LOCKOUT.MINUTES;

    if (updatedFailedCount >= maxAttempts) {
      const lockoutEnd = new Date(Date.now() + lockoutMinutes * 60 * 1000);

      await user.update({
        accessFailedCount: updatedFailedCount,
        lockoutEnd,
      });
    } else {
      await user.update({
        accessFailedCount: updatedFailedCount,
      });
    }
  }

  async findByEmail(
    email: string,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.userRepository.findByEmail(email, options);
  }

  async findByUserName(
    userName: string,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.userRepository.findByUserName(userName, options);
  }

  async addToRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<void> {
    await this.userRepository.addToRole(userId, roleId, transaction);
  }

  async removeFromRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<void> {
    await this.userRepository.removeFromRole(userId, roleId, transaction);
  }

  async getRoles(userId: string, options?: FindOptions): Promise<Role[]> {
    return this.userRepository.getRoles(userId, options);
  }

  async findByClaim(
    claim: WhereOptions,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.userRepository.findByClaim(claim, options);
  }

  async getClaims(userId: string, options?: FindOptions): Promise<UserClaim[]> {
    const user = await this.findById(userId, {
      include: [{ model: UserClaim }],
      ...options,
    });
    return user?.claims ?? [];
  }

  async getLogins(userId: string, options?: FindOptions): Promise<UserLogin[]> {
    const user = await this.findById(userId, {
      include: [{ model: UserLogin }],
      ...options,
    });
    return user?.logins ?? [];
  }

  async getTokens(userId: string, options?: FindOptions): Promise<UserToken[]> {
    const user = await this.findById(userId, {
      include: [{ model: UserToken }],
      ...options,
    });
    return user?.tokens ?? [];
  }

  async setLockoutEnd(
    userId: string,
    lockoutEnd: Date | null,
    transaction?: Transaction,
  ): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    await user.update({ lockoutEnd }, { transaction });
    return user;
  }

  private async buildPasetoPayload(
    user: User,
  ): Promise<Record<string, unknown>> {
    const [roles, claims] = await Promise.all([
      this.getRoles(user.id),
      this.getClaims(user.id),
    ]);

    const roleNames = roles.map((role) => role.name).filter(isNonEmptyString);
    const policyClaims = claims
      .filter((claim) => claim.claimType === 'policy')
      .map((claim) => claim.claimValue)
      .filter(isNonEmptyString);

    const payload: Record<string, unknown> = {
      sub: user.id,
    };

    if (user.email) {
      payload.email = user.email;
    }

    if (roleNames.length > 0) {
      payload.roles = roleNames;
    }

    if (policyClaims.length > 0) {
      payload.policies = policyClaims;
    }

    return payload;
  }
}
