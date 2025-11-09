import { FindOptions } from 'sequelize';
import { Transaction } from 'sequelize';
import { Role, RoleClaim } from '../entities';
import { IBaseRepository } from './base.repository.interface';

export interface IRoleRepository extends IBaseRepository<Role> {
  findByName(name: string, options?: FindOptions): Promise<Role | null>;
  addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<RoleClaim>;
  removeClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<boolean>;
  getClaims(roleId: string, options?: FindOptions): Promise<RoleClaim[]>;
}
