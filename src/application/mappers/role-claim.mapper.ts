import { RoleClaim } from 'src/domain/entities';
import { RoleClaimResponseDto } from 'src/shared/dtos';

export class RoleClaimMapper {
  static toArrayResponse(entity: RoleClaim[]): RoleClaimResponseDto[] {
    return entity.map((item) => ({
      id: item.id,
      roleId: item.roleId,
      claimType: item.claimType || '',
      claimValue: item.claimValue || '',
    }));
  }
}
