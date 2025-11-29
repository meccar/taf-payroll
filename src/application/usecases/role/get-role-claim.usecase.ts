import { RoleClaimService } from '../../services';
import { RoleClaimResponseDto } from 'src/shared/dtos';
import { RoleClaimMapper } from 'src/application/mappers/role-claim.mapper';

export class GetRoleClaimUseCase {
  constructor(private readonly roleClaimService: RoleClaimService) {}

  async execute(roleId: string): Promise<RoleClaimResponseDto[]> {
    return RoleClaimMapper.toArrayResponse(
      await this.roleClaimService.getClaims(roleId),
    );
  }
}
