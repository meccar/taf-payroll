import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/sequelize';
import { Transaction, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Role,
  User,
  UserClaim,
  UserLogin,
  UserToken,
} from '../../domain/entities';
import { BaseService } from './base.service';
import * as bcrypt from 'bcrypt';
import { SECURITY } from '../../shared/constants/security.constants';
import { AUTH } from '../../shared/constants/auth.constants';
import {
  generateConcurrencyStamp,
  generateSecurityStamp,
} from '../../shared/utils';
import { generatePasetoToken } from '../../shared/utils/paseto.util';
import { AUTH_MESSAGES } from '../../shared/messages/auth.messages';
import { EventEmitter2 } from '@nestjs/event-emitter';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectConnection()
    protected readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super(User, eventEmitter, sequelize);
  }

  protected getEntityName(): string {
    return User.name;
  }

  async getUsers(): Promise<User[]> {
    return this.findAll();
  }

  async createUser(
    user: Partial<User>,
    transaction?: Transaction,
  ): Promise<User> {
    let existingUser: User | null = null;

    if (user.normalizedEmail)
      existingUser = await this.findByEmail(user.normalizedEmail);

    if (!existingUser && user.normalizedUserName)
      existingUser = await this.findByUserName(user.normalizedUserName);

    if (existingUser)
      throw new BadRequestException(AUTH_MESSAGES.USER_ALREADY_EXISTS);

    user.passwordHash = await bcrypt.hash(
      user.passwordHash!,
      SECURITY.BCRYPT_SALT_ROUNDS,
    );
    user.securityStamp = generateSecurityStamp();
    user.concurrencyStamp = generateConcurrencyStamp();

    // Create user with transaction
    const result = await this.create(user, undefined, transaction);
    if (!result)
      throw new BadRequestException(AUTH_MESSAGES.FAILED_TO_CREATE_USER);

    return result;
  }

  async login(user: Partial<User>, transaction?: Transaction): Promise<string> {
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
      existingUser = await this.update(
        existingUser.id,
        {
          accessFailedCount: 0,
          lockoutEnd: undefined,
        },
        undefined,
        transaction,
      );
    }

    if (user.normalizedEmail && !existingUser!.emailConfirmed)
      throw new UnauthorizedException(AUTH_MESSAGES.EMAIL_NOT_CONFIRMED);

    // if (!existingUser!.twoFactorEnabled)
    //   throw new UnauthorizedException(AUTH_MESSAGES.TWO_FACTOR_NOT_ENABLED);

    const payload = await this.buildPasetoPayload(existingUser!);

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

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { normalizedEmail: email.toUpperCase() },
    });
  }

  async findByUserName(userName: string): Promise<User | null> {
    return this.findOne({
      where: { normalizedUserName: userName.toUpperCase() },
    });
  }

  async getRoles(userId: string): Promise<Role[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
    });
    return user?.roles ?? [];
  }

  async findByClaim(claim: WhereOptions): Promise<User | null> {
    return this.findOne({
      include: [
        {
          model: UserClaim,
          where: claim,
        },
      ],
    });
  }

  async getClaims(userId: string): Promise<UserClaim[]> {
    const user = await this.findById(userId, {
      include: [{ model: UserClaim }],
    });
    return user?.claims ?? [];
  }

  async getLogins(userId: string): Promise<UserLogin[]> {
    const user = await this.findById(userId, {
      include: [{ model: UserLogin }],
    });
    return user?.logins ?? [];
  }

  async getTokens(userId: string): Promise<UserToken[]> {
    const user = await this.findById(userId, {
      include: [{ model: UserToken }],
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

  async buildPasetoPayload(user: User): Promise<Record<string, unknown>> {
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

    if (user.email) payload.email = user.email;

    if (roleNames.length > 0) payload.roles = roleNames;

    if (policyClaims.length > 0) payload.policies = policyClaims;

    return payload;
  }
}
