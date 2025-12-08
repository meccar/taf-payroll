import { PermissionDto } from "src/shared/dtos";
import { RoleClaim } from "../entities";
import { DeleteResult } from "../types";
import { BasePort } from "./base.port";

export interface RoleClaimPort extends BasePort<RoleClaim> {
  getClaims(roleId: string): Promise<RoleClaim[]>;
  addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<RoleClaim>;
  removeClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<DeleteResult>;
  addPermission(
    roleId: string,
    permission: PermissionDto[],
    transaction?: any,
  ): Promise<RoleClaim[]>;
}
