import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptions, Transaction } from 'sequelize';
import { User, UserLogin } from '../../domain/entities';
import { BaseService } from './base.service';

@Injectable()
export class UserLoginService extends BaseService<UserLogin> {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super(UserLogin, eventEmitter);
  }

  protected getEntityName(): string {
    return UserLogin.name;
  }

  async findByUserId(
    userId: string,
    options?: FindOptions,
  ): Promise<UserLogin[]> {
    return this.findAll({
      where: { userId },
      ...options,
    });
  }

  async findByLogin(
    loginProvider: string,
    providerKey: string,
    options?: FindOptions,
  ): Promise<UserLogin | null> {
    return await this.findOne({
      where: { loginProvider, providerKey },
      include: [User],
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

  async hasProvider(userId: string, provider: string): Promise<boolean> {
    const count = await this.count({
      where: { userId, loginProvider: provider },
    });
    return count > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.count({
      where: { userId },
    });
  }
}
