import { RoleClaimService } from '../../services';

export class GetRoleClaimUseCase {
  constructor(private readonly roleClaimService: RoleClaimService) {}

  async execute(roleId: string) {
    return this.roleClaimService.getClaims(roleId);
  }
}
