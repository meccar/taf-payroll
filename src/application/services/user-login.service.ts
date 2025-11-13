import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptions, Transaction } from 'sequelize';
import { UserLogin } from '../../domain/entities';
import { BaseService } from './base.service';

@Injectable()
export class UserLoginService extends BaseService<UserLogin> {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super(UserLogin, eventEmitter);
  }

  protected getEntityName(): string {
    return UserLogin.name;
  }

  async findByLogin(
    loginProvider: string,
    providerKey: string,
    options?: FindOptions,
  ): Promise<UserLogin | null> {
    return UserLogin.findOne({
      where: { loginProvider, providerKey },
      ...options,
    });
  }

  async getUserLogins(
    userId: string,
    options?: FindOptions,
  ): Promise<UserLogin[]> {
    return UserLogin.findAll({
      where: { userId },
      ...options,
    });
  }

  async addLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    providerDisplayName?: string,
    transaction?: Transaction,
  ): Promise<UserLogin> {
    return UserLogin.create(
      {
        userId,
        loginProvider,
        providerKey,
        providerDisplayName,
      },
      { transaction },
    );
  }

  async removeLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    const deleted = await UserLogin.destroy({
      where: { userId, loginProvider, providerKey },
      transaction,
    });
    return deleted > 0;
  }
}
