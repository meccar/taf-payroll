import { Injectable } from '@nestjs/common';
import { Role, User, UserClaim, UserLogin, UserToken } from '../models';
import {
  Role as RoleEntity,
  User as UserEntity,
  UserClaim as UserClaimEntity,
  UserLogin as UserLoginEntity,
  UserToken as UserTokenEntity,
} from 'src/domain/entities';
import { BaseRepository } from './base.repository';
import { FindOptions, WhereOptions } from 'sequelize';
import { UserAdapter } from 'src/domain/adapters';

@Injectable()
export class UserRepository
  extends BaseRepository<User, UserEntity>
  implements UserAdapter
{
  constructor() {
    super(User, UserEntity);
  }

  protected getEntityName(): string {
    return User.name;
  }

  async getUsers(options?: FindOptions): Promise<UserEntity[]> {
    return await this.findAll(options);
  }

  async findByEmail(
    email: string,
    options?: FindOptions,
  ): Promise<UserEntity | null> {
    return await this.findOne({
      where: { normalizedEmail: email.toUpperCase() },
      ...options,
    });
  }

  async findByUsername(
    username: string,
    options?: FindOptions,
  ): Promise<UserEntity | null> {
    return await this.findOne({
      where: { normalizedUsername: username.toUpperCase() },
      ...options,
    });
  }

  async getRoles(userId: string, options?: FindOptions): Promise<RoleEntity[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
      ...options,
    });
    if (!user || !user.roles) return [];
    return user.roles;
  }

  async findByClaim(claim: WhereOptions): Promise<UserEntity | null> {
    return await this.findOne({
      include: [
        {
          model: UserClaim,
          where: claim,
        },
      ],
    });
  }

  async getClaims(
    userId: string,
    options?: FindOptions,
  ): Promise<UserClaimEntity[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: UserClaim,
        },
      ],
      ...options,
    });

    if (!user || !user.claims) return [];

    return user.claims;
  }

  async getLogins(
    userId: string,
    options?: FindOptions,
  ): Promise<UserLoginEntity[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: UserLogin,
        },
      ],
      ...options,
    });

    if (!user || !user.logins) return [];

    return user.logins;
  }

  async getTokens(
    userId: string,
    options?: FindOptions,
  ): Promise<UserTokenEntity[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: UserToken,
        },
      ],
      ...options,
    });

    if (!user || !user.tokens) return [];

    return user.tokens;
  }
}
