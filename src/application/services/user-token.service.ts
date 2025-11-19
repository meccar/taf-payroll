import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptions, Transaction } from 'sequelize';
import { UserToken } from '../../domain/entities';
import { BaseService } from './base.service';
import { generateEmailConfirmationToken } from 'src/shared/utils';
import { CreateResult } from 'src/domain/types';
import { AUTH_MESSAGES } from 'src/shared/messages';

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
    transaction?: Transaction,
  ): Promise<CreateResult<UserToken>> {
    const token = generateEmailConfirmationToken();
    const existing = await this.getToken(userId, loginProvider, name);
    if (existing) {
      await existing.update({ value: token }, { transaction });
      return { entity: existing, transaction };
    }

    const result = await this.create(
      {
        userId,
        loginProvider,
        name,
        value: token,
      },
      undefined,
      transaction,
    );

    if (!result)
      throw new BadRequestException(AUTH_MESSAGES.FAILED_TO_CREATE_USER);

    return result;
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
