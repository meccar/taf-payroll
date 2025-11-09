import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { UserLogin } from '../../domain/entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserLoginRepository extends BaseRepository<UserLogin> {
  constructor() {
    super(UserLogin);
  }

  async findByLogin(
    loginProvider: string,
    providerKey: string,
    options?: FindOptions,
  ): Promise<UserLogin | null> {
    return this.findOne({
      where: { loginProvider, providerKey },
      ...options,
    });
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

  async addLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    providerDisplayName?: string,
    transaction?: Transaction,
  ): Promise<UserLogin> {
    return await this.create(
      {
        userId,
        loginProvider,
        providerKey,
        providerDisplayName,
      },
      transaction,
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
