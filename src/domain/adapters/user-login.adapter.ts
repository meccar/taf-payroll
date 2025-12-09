import { UserLogin } from '../entities';
import { DeleteResult } from '../types';
import { BaseAdapter } from './base.adapter';

export abstract class UserLoginAdapter extends BaseAdapter<UserLogin> {
  abstract findByUserId(userId: string, options?: any): Promise<UserLogin[]>;

  abstract findByLogin(
    loginProvider: string,
    providerKey: string,
    options?: any,
  ): Promise<UserLogin | null>;

  abstract getLogins(userId: string): Promise<UserLogin[]>;

  abstract addLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    providerDisplayName?: string,
    transaction?: any,
  ): Promise<UserLogin>;

  abstract removeLogin(
    userId: string,
    loginProvider: string,
    providerKey: string,
    transaction?: any,
  ): Promise<DeleteResult>;
  abstract hasProvider(userId: string, provider: string): Promise<boolean>;
  abstract countByUserId(userId: string): Promise<number>;
}
