import { UserToken } from '../entities';
import { CreateResult, DeleteResult } from '../types';
import { BaseAdapter } from './base.adapter';

export abstract class UserTokenAdapter extends BaseAdapter<UserToken> {
  abstract getToken(
    userId: string,
    loginProvider: string,
    name: string,
    options?: any,
    transaction?: any,
  ): Promise<UserToken | null>;
  abstract getTokensByUser(
    userId: string,
    options?: any,
    transaction?: any,
  ): Promise<UserToken[]>;
  abstract setToken(
    userId: string,
    loginProvider: string,
    name: string,
    transaction?: any,
  ): Promise<CreateResult<UserToken>>;
  abstract removeToken(
    userId: string,
    loginProvider: string,
    name: string,
    transaction?: any,
  ): Promise<DeleteResult>;
}
