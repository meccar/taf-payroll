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
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { UserAdapter } from 'src/domain/adapters';
import { AutoMapper } from 'src/infrastructure/database/sequelize/mapper/auto-mapper';

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

  async getUsers(options?: FindOptions): Promise<UserEntity[]> {
    const models = await this.findAll(options);
    return models.map((model) => AutoMapper.toEntity(UserEntity, model));
  }

  async findByEmail(
    email: string,
    options?: FindOptions,
  ): Promise<UserEntity | null> {
    const model = await this.findOne({
      where: { normalizedEmail: email.toUpperCase() },
      ...options,
    });
    return model ? AutoMapper.toEntity(UserEntity, model) : null;
  }

  async findByUsername(
    username: string,
    options?: FindOptions,
  ): Promise<UserEntity | null> {
    const model = await this.findOne({
      where: { normalizedUsername: username.toUpperCase() },
      ...options,
    });
    return model ? AutoMapper.toEntity(UserEntity, model) : null;
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
    return user.roles.map((role) => AutoMapper.toEntity(RoleEntity, role));
  }

  async findByClaim(claim: WhereOptions): Promise<UserEntity | null> {
    const model = await this.findOne({
      include: [
        {
          model: UserClaim,
          where: claim,
        },
      ],
    });
    return model ? AutoMapper.toEntity(UserEntity, model) : null;
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

    return user.claims.map((claim) =>
      AutoMapper.toEntity(UserClaimEntity, claim),
    );
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

    return user.logins.map((login) =>
      AutoMapper.toEntity(UserLoginEntity, login),
    );
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

    return user.tokens.map((token) =>
      AutoMapper.toEntity(UserTokenEntity, token),
    );
  }
}
