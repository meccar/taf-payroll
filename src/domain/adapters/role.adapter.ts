import { Role } from '../entities';
import { BaseAdapter } from './base.adapter';

export abstract class RoleAdapter extends BaseAdapter<Role> {
  abstract getAll(): Promise<Role[]>;
  abstract findByName(name: string): Promise<Role | null>;
}
