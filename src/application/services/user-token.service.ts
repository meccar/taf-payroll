import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptions, Transaction } from 'sequelize';
import { UserToken } from '../../domain/entities';
import { BaseService } from './base.service';

@Injectable()
export class UserTokenService extends BaseService<UserToken> {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super(UserToken, eventEmitter);
  }

  protected getEntityName(): string {
    return UserToken.name;
  }

  async getToken(
    userId: string,
    loginProvider: string,
    name: string,
    options?: FindOptions,
  ): Promise<UserToken | null> {
    return UserToken.findOne({
      where: { userId, loginProvider, name },
      ...options,
    });
  }

  async getTokensByUser(
    userId: string,
    options?: FindOptions,
  ): Promise<UserToken[]> {
    return UserToken.findAll({
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

    return UserToken.create(
      {
        userId,
        loginProvider,
        name,
        value,
      },
      { transaction },
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
