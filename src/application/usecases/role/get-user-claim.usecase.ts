import { BadRequestException } from '@nestjs/common';
import { MESSAGES } from '../../../shared/messages';
import { UserClaimDto } from 'src/shared/dtos';
import {
  RoleClaimAdapter,
  UserClaimAdapter,
  UserRoleAdapter,
} from 'src/domain/adapters';

export class GetUserClaimsUseCase {
  constructor(
    private readonly userRoleAdapter: UserRoleAdapter,
    private readonly roleClaimAdapter: RoleClaimAdapter,
    private readonly userClaimAdapter: UserClaimAdapter,
  ) {}

  async execute(userId: string): Promise<Array<UserClaimDto>> {
    const roles = await this.userRoleAdapter.getRolesForUser(userId);
    if (!roles || roles.length === 0)
      throw new BadRequestException(MESSAGES.ERR_UNAUTHORIZED);

    const claims: Array<UserClaimDto> = [];

    for (const role of roles) {
      const roleClaims = await this.roleClaimAdapter.getClaims(role.id);

      if (roleClaims && roleClaims.length > 0) {
        roleClaims.forEach((claim) => {
          if (claim.claimType && claim.claimValue)
            claims.push({
              type: claim.claimType,
              value: claim.claimValue,
            });
        });
      }
    }

    const userClaims = await this.userClaimAdapter.getClaims(userId);
    if (userClaims && userClaims.length > 0) {
      userClaims.forEach((claim) => {
        if (claim.claimType && claim.claimValue)
          claims.push({
            type: claim.claimType,
            value: claim.claimValue,
          });
      });
    }

    return this.deduplicateClaims(claims);
  }

  async getPermissions(userId: string): Promise<string[]> {
    const allClaims = await this.execute(userId);

    return allClaims
      .filter((claim) => claim.type === 'Permission')
      .map((claim) => claim.value);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getPermissions(userId);
    return permissions.includes(permission);
  }

  async hasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getPermissions(userId);
    return permissions.some((p) => userPermissions.includes(p));
  }

  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getPermissions(userId);
    return permissions.every((p) => userPermissions.includes(p));
  }

  private deduplicateClaims(claims: Array<UserClaimDto>): Array<UserClaimDto> {
    const seen = new Set<string>();
    return claims.filter((claim) => {
      const key = `${claim.type}:${claim.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
