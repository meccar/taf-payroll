import { Injectable } from '@nestjs/common';
import { Role, User, UserClaim, UserLogin, UserToken } from '../models';
import { BaseRepository } from './base.repository';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { UserAdapter } from 'src/domain/adapters';

@Injectable()
export class UserRepository
  extends BaseRepository<User>
  implements UserAdapter
{
  constructor() {
    super(User);
  }

  protected getEntityName(): string {
    return User.name;
  }

  async getUsers(options?: FindOptions): Promise<User[]> {
    return this.findAll(options);
  }

  async findByEmail(
    email: string,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.findOne({
      where: { normalizedEmail: email.toUpperCase() },
      ...options,
    });
  }

  async findByUsername(
    username: string,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.findOne({
      where: { normalizedUsername: username.toUpperCase() },
      ...options,
    });
  }

  async getRoles(userId: string, options?: FindOptions): Promise<Role[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
      ...options,
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

  async getClaims(userId: string, options?: FindOptions): Promise<UserClaim[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: UserClaim,
        },
      ],
      ...options,
    });

    return user?.claims ?? [];
  }

  async getLogins(userId: string, options?: FindOptions): Promise<UserLogin[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: UserLogin,
        },
      ],
      ...options,
    });

    return user?.logins ?? [];
  }

  async getTokens(userId: string, options?: FindOptions): Promise<UserToken[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: UserToken,
        },
      ],
      ...options,
    });

    return user?.tokens ?? [];
  }

  async setLockoutEnd(
    userId: string,
    lockoutEnd: Date | null,
    options?: FindOptions,
    transaction?: Transaction,
  ): Promise<User | null> {
    const user = await this.findById(userId, options);
    if (!user) return null;
    user.lockoutEnd = lockoutEnd;
    await this.update(user.id, user, transaction);
    return user;
  }
}
