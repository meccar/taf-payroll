import { Role } from '../entities';
import { CreateResult, UpdateResult } from '../types';
import { BaseAdapter } from './base.adapter';

export abstract class RoleAdapter extends BaseAdapter<Role> {
  abstract getAll(): Promise<Role[]>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract createRole(
    role: Partial<Role>,
    transaction?: any,
  ): Promise<CreateResult<Role>>;
  abstract updateRole(
    id: string,
    role: Partial<Role>,
    transaction?: any,
  ): Promise<UpdateResult<Role>>;
  abstract deleteRole(id: string, transaction?: any): Promise<boolean>;
}
