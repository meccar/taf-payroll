import { ClaimDto } from 'src/shared/dtos';
import { RoleClaimService } from '../../services';

export class CreateRoleClaimUseCase {
  constructor(private readonly roleClaimService: RoleClaimService) {}

  async execute(roleId: string, claim: ClaimDto) {
    return this.roleClaimService.addClaim(
      roleId,
      claim.claimType,
      claim.claimValue,
    );
  }
}
