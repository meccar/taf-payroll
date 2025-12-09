import { PermissionDto } from 'src/shared/dtos';
import { RoleClaim } from '../entities';
import { DeleteResult } from '../types';
import { BaseAdapter } from './base.adapter';

export abstract class RoleClaimAdapter extends BaseAdapter<RoleClaim> {
  abstract getClaims(roleId: string): Promise<RoleClaim[]>;
  abstract addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<RoleClaim>;
  abstract removeClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<DeleteResult>;
  abstract addPermission(
    roleId: string,
    permission: PermissionDto[],
    transaction?: any,
  ): Promise<RoleClaim[]>;
}
