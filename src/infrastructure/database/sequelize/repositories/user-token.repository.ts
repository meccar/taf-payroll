import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { generateEmailConfirmationToken } from 'src/shared/utils';
import { CreateResult, DeleteResult } from 'src/domain/types';
import { MESSAGES } from 'src/shared/messages';
import { BaseRepository } from './base.repository';
import { UserToken } from '../models';

@Injectable()
export class UserTokenRepository extends BaseRepository<UserToken> {
  constructor() {
    super(UserToken);
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
    transaction?: Transaction,
  ): Promise<CreateResult<UserToken>> {
    const token = generateEmailConfirmationToken();
    const existing = await this.getToken(userId, loginProvider, name);
    if (existing) {
      await this.update(existing.id, { value: token }, transaction);
      return { entity: existing, transaction };
    }

    const result = await this.create(
      {
        userId,
        loginProvider,
        name,
        value: token,
      },
      transaction,
    );

    if (!result)
      throw new BadRequestException(MESSAGES.ERR_FAILED_TO_CREATE_USER);

    return result;
  }

  async removeToken(
    userId: string,
    loginProvider: string,
    name: string,
    transaction?: Transaction,
  ): Promise<DeleteResult> {
    return await this.delete(
      { where: { userId, loginProvider, name } },
      transaction,
    );
  }
}
