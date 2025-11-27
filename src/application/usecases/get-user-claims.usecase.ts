import { BadRequestException } from '@nestjs/common';
import { MESSAGES } from '../../shared/messages';
import {
  RoleClaimService,
  UserClaimService,
  UserRoleService,
} from '../services';

export class GetUserClaimsUseCase {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly roleClaimService: RoleClaimService,
    private readonly userClaimService: UserClaimService,
  ) {}

  async execute(
    userId: string,
  ): Promise<Array<{ type: string; value: string }>> {
    const roles = await this.userRoleService.getRolesForUser(userId);
    if (!roles || roles.length === 0)
      throw new BadRequestException(MESSAGES.ERR_USER_NOT_FOUND);

    const claims: Array<{ type: string; value: string }> = [];

    for (const role of roles) {
      const roleClaims = await this.roleClaimService.getClaims(role.id);

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

    const userClaims = await this.userClaimService.getClaims(userId);
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

  private deduplicateClaims(
    claims: Array<{ type: string; value: string }>,
  ): Array<{ type: string; value: string }> {
    const seen = new Set<string>();
    return claims.filter((claim) => {
      const key = `${claim.type}:${claim.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
