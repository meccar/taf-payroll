import { FindOptions, WhereOptions } from 'sequelize';
import { Transaction } from 'sequelize';
import { User, Role } from '../entities';
import { IBaseRepository } from './base.repository.interface';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string, options?: FindOptions): Promise<User | null>;
  findByUserName(userName: string, options?: FindOptions): Promise<User | null>;
  addToRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<void>;
  removeFromRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<void>;
  getRoles(userId: string, options?: FindOptions): Promise<Role[]>;
  findByClaim(claim: WhereOptions, options?: FindOptions): Promise<User | null>;
}
