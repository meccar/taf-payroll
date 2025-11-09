import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { UserLogin } from '../../domain/entities';
import { BaseService } from './base.service';
import { UserLoginRepository } from '../../infrastructure/repositories/user-login.repository';

@Injectable()
export class UserLoginService extends BaseService<UserLogin> {
  constructor(private readonly userLoginRepository: UserLoginRepository) {
    super(userLoginRepository);
  }

  async findByLogin(
    loginProvider: string,
    providerKey: string,
    options?: FindOptions,
  ): Promise<UserLogin | null> {
    return this.userLoginRepository.findByLogin(
      loginProvider,
      providerKey,
      options,
    );
  }

  async getUserLogins(
    userId: string,
    options?: FindOptions,
  ): Promise<UserLogin[]> {
    return this.userLoginRepository.findByUserId(userId, options);
  }

  async addLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    providerDisplayName?: string,
    transaction?: Transaction,
  ): Promise<UserLogin> {
    return this.userLoginRepository.addLogin(
      userId,
      loginProvider,
      providerKey,
      providerDisplayName,
      transaction,
    );
  }

  async removeLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    return this.userLoginRepository.removeLogin(
      userId,
      loginProvider,
      providerKey,
      transaction,
    );
  }
}
