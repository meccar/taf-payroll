import { UserRole } from '../entities';
import { DeleteResult } from '../types';
import { BaseAdapter } from './base.adapter';

export abstract class UserRoleAdapter extends BaseAdapter<UserRole> {
  abstract addToRole(
    userId: string,
    roleId: string,
    transaction?: any,
  ): Promise<UserRole>;

  abstract removeFromRole(
    userId: string,
    roleId: string,
    transaction?: any,
  ): Promise<DeleteResult>;
  abstract getAllUserRoles(): Promise<UserRole[]>;
  abstract getRolesForUser(userId: string): Promise<UserRole[]>;
  abstract updateUserRole(
    userId: string,
    roleId: string,
    transaction?: any,
  ): Promise<UserRole>;
  abstract getUsersByRole(roleId: string): Promise<UserRole[]>;
  abstract getRolesByUser(userId: string): Promise<UserRole[]>;
}
