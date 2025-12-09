import { Role, User, UserClaim, UserLogin, UserToken } from '../entities';
import { BaseAdapter } from './base.adapter';

export abstract class UserAdapter extends BaseAdapter<User> {
  abstract getUsers(options?: any): Promise<User[]>;
  abstract findByEmail(email: string, options: any): Promise<User | null>;
  abstract findByUsername(username: string, options: any): Promise<User | null>;
  abstract getRoles(userId: string, options?: any): Promise<Role[]>;
  abstract findByClaim(claim: any): Promise<User | null>;
  abstract getClaims(userId: string, options?: any): Promise<UserClaim[]>;
  abstract getLogins(userId: string, options?: any): Promise<UserLogin[]>;
  abstract getTokens(userId: string, options?: any): Promise<UserToken[]>;
  abstract setLockoutEnd(
    userId: string,
    lockoutEnd: Date | null,
    transaction?: any,
  ): Promise<User | null>;
}
