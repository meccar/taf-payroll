import { RoleClaimResponseDto } from 'src/shared/dtos';
import { RoleClaimMapper } from 'src/application/mappers/role-claim.mapper';
import { RoleClaimAdapter } from 'src/domain/adapters';

export class GetRoleClaimUseCase {
  constructor(private readonly roleClaimAdapter: RoleClaimAdapter) {}

  async execute(roleId: string): Promise<RoleClaimResponseDto[]> {
    return RoleClaimMapper.toArrayResponse(
      await this.roleClaimAdapter.getClaims(roleId),
    );
  }
}
