import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { UserToken } from '../../domain/entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserTokenRepository extends BaseRepository<UserToken> {
  constructor() {
    super(UserToken);
  }

  async getToken(
    userId: string,
    loginProvider: string,
    name: string,
    options?: FindOptions,
  ): Promise<UserToken | null> {
    return this.findOne({
      where: { userId, loginProvider, name },
      ...options,
    });
  }

  async getTokensByUser(
    userId: string,
    options?: FindOptions,
  ): Promise<UserToken[]> {
    return this.findAll({
      where: { userId },
      ...options,
    });
  }

  async setToken(
    userId: string,
    loginProvider: string,
    name: string,
    value: string,
    transaction?: Transaction,
  ): Promise<UserToken> {
    const existing = await this.getToken(userId, loginProvider, name);
    if (existing) {
      await existing.update({ value }, { transaction });
      return existing;
    }

    return await this.create(
      {
        userId,
        loginProvider,
        name,
        value,
      },
      transaction,
    );
  }

  async removeToken(
    userId: string,
    loginProvider: string,
    name: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    const deleted = await UserToken.destroy({
      where: { userId, loginProvider, name },
      transaction,
    });
    return deleted > 0;
  }
}
