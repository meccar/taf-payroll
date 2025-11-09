import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { UserToken } from '../../domain/entities';
import { BaseService } from './base.service';
import { UserTokenRepository } from '../../infrastructure/repositories/user-token.repository';

@Injectable()
export class UserTokenService extends BaseService<UserToken> {
  constructor(private readonly userTokenRepository: UserTokenRepository) {
    super(userTokenRepository);
  }

  async getToken(
    userId: string,
    loginProvider: string,
    name: string,
    options?: FindOptions,
  ): Promise<UserToken | null> {
    return this.userTokenRepository.getToken(
      userId,
      loginProvider,
      name,
      options,
    );
  }

  async getTokensByUser(
    userId: string,
    options?: FindOptions,
  ): Promise<UserToken[]> {
    return this.userTokenRepository.getTokensByUser(userId, options);
  }

  async setToken(
    userId: string,
    loginProvider: string,
    name: string,
    value: string,
    transaction?: Transaction,
  ): Promise<UserToken> {
    return this.userTokenRepository.setToken(
      userId,
      loginProvider,
      name,
      value,
      transaction,
    );
  }

  async removeToken(
    userId: string,
    loginProvider: string,
    name: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    return this.userTokenRepository.removeToken(
      userId,
      loginProvider,
      name,
      transaction,
    );
  }
}
