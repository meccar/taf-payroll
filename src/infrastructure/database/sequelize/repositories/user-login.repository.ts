import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import { DeleteResult } from 'src/domain/types';
import { User, UserLogin } from '../models';
import { UserLoginAdapter } from 'src/domain/adapters';
import { UserLogin as UserLoginEntity } from 'src/domain/entities';

@Injectable()
export class UserLoginRepository
  extends BaseRepository<UserLogin, UserLoginEntity>
  implements UserLoginAdapter
{
  constructor() {
    super(UserLogin, UserLoginEntity);
  }

  protected getEntityName(): string {
    return UserLogin.name;
  }

  async findByUserId(
    userId: string,
    options?: FindOptions,
  ): Promise<UserLoginEntity[]> {
    return this.findAll({
      where: { userId },
      ...options,
    });
  }

  async findByLogin(
    loginProvider: string,
    providerKey: string,
    options?: FindOptions,
  ): Promise<UserLoginEntity | null> {
    return await this.findOne({
      where: { loginProvider, providerKey },
      include: [User],
      ...options,
    });
  }

  async getLogins(userId: string): Promise<UserLoginEntity[]> {
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
  ): Promise<UserLoginEntity> {
    const result = await this.create(
      {
        userId,
        loginProvider,
        providerKey,
        providerDisplayName,
      },
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
  ): Promise<DeleteResult> {
    return await this.delete({
      where: { userId, loginProvider, providerKey },
      transaction,
    });
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
