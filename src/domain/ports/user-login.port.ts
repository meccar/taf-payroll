import { UserLogin } from '../entities';
import { DeleteResult } from '../types';
import { BasePort } from './base.port';

export interface UserLoginPort extends BasePort<UserLogin> {
  findByUserId(userId: string, options?: any): Promise<UserLogin[]>;

  findByLogin(
    loginProvider: string,
    providerKey: string,
    options?: any,
  ): Promise<UserLogin | null>;

  getLogins(userId: string): Promise<UserLogin[]>;

  addLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    providerDisplayName?: string,
    transaction?: any,
  ): Promise<UserLogin>;

  removeLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    transaction?: any,
  ): Promise<DeleteResult>;
  hasProvider(userId: string, provider: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}
