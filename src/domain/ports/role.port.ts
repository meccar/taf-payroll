import { Role } from '../entities';
import { CreateResult, UpdateResult } from '../types';
import { BasePort } from './base.port';

export interface RolePort extends BasePort<Role> {
  getAll(): Promise<Role[]>;
  findByName(name: string): Promise<Role | null>;
  createRole(
    role: Partial<Role>,
    transaction?: any,
  ): Promise<CreateResult<Role>>;
  updateRole(
    id: string,
    role: Partial<Role>,
    transaction?: any,
  ): Promise<UpdateResult<Role>>;
  deleteRole(id: string, transaction?: any): Promise<boolean>;
}
