import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import {
  generateConcurrencyStamp,
  generateSecurityStamp,
} from '../../shared/utils';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  async getUsers(): Promise<User[]> {
    return this.findAll();
  }

  async createUser(user: Partial<User>): Promise<User> {
    if (!user.normalizedEmail && !user.normalizedUserName)
      throw new BadRequestException('Email or username is required');

    if (!user.passwordHash)
      throw new BadRequestException('Password is required');

    let existingUser: User | null = null;

    if (user.normalizedEmail)
      existingUser = await this.findByEmail(user.normalizedEmail);

    if (!existingUser && user.normalizedUserName)
      existingUser = await this.findByUserName(user.normalizedUserName);

    if (existingUser) throw new BadRequestException('User already exists');

    user.passwordHash = await bcrypt.hash(
      user.passwordHash,
      SECURITY.BCRYPT_SALT_ROUNDS,
    );
    user.securityStamp = generateSecurityStamp();
    user.concurrencyStamp = generateConcurrencyStamp();

    const createdUser = await this.userRepository.create(user);

    return createdUser;
  }

  async login(user: Partial<User>): Promise<User> {
    if (!user.normalizedEmail && !user.normalizedUserName)
      throw new BadRequestException('Email or username is required');

    if (!user.passwordHash)
      throw new BadRequestException('Password is required');

    let existingUser: User | null = null;

    if (user.normalizedEmail)
      existingUser = await this.findByEmail(user.normalizedEmail);

    if (!existingUser && user.normalizedUserName)
      existingUser = await this.findByUserName(user.normalizedUserName);

    if (!existingUser) throw new UnauthorizedException('Unauthorized');

    if (existingUser.lockoutEnabled && existingUser.lockoutEnd) {
      const now = new Date();
      if (existingUser.lockoutEnd.getTime() > now.getTime()) {
        const remainingMinutes = Math.ceil(
          (existingUser.lockoutEnd.getTime() - now.getTime()) / 60000,
        );
        throw new UnauthorizedException(
          `Account is locked. Try again in ${remainingMinutes} minutes.`,
        );
      }
    }

    const isPasswordValid = await bcrypt.compare(
      user.passwordHash,
      existingUser.passwordHash!,
    );
    if (!isPasswordValid) {
      await this.handleFailedLogin(existingUser);
      throw new UnauthorizedException('Unauthorized');
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
      throw new UnauthorizedException('Email is not confirmed');

    if (!existingUser.twoFactorEnabled)
      throw new UnauthorizedException(
        'Two-factor authentication is not enabled',
      );

    return existingUser;
  }

  async handleFailedLogin(user: User): Promise<void> {
    if (!user.lockoutEnabled) return;

    const updatedFailedCount = (user.accessFailedCount ?? 0) + 1;
    const maxAttempts = 5;
    const lockoutMinutes = 15;

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
}
