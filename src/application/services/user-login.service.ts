import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { UserLogin } from '../../domain/entities';
import { BaseService } from './base.service';
import { UserLoginRepository } from '../../infrastructure/repositories/user-login.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserLoginService extends BaseService<UserLogin> {
  constructor(
    protected readonly userLoginRepository: UserLoginRepository,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super(userLoginRepository, eventEmitter);
  }

  protected getEntityName(): string {
    return UserLogin.name;
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
