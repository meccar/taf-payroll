import { BadRequestException, Injectable } from '@nestjs/common';
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

  async getLogins(userId: string): Promise<UserLogin[]> {
    return this.findAll({
      where: { userId },
    });
  }

  async addLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    providerDisplayName?: string,
    transaction?: Transaction,
  ): Promise<UserLogin> {
    const result = await this.create(
      {
        userId,
        loginProvider,
        providerKey,
        providerDisplayName,
      },
      undefined,
      transaction,
    );
    if (!result) throw new BadRequestException('Failed to add login');
    return result.entity;
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
