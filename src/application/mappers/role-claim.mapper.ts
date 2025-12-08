import { RoleClaim } from 'src/domain/entities';
import { RoleClaimResponseDto } from 'src/shared/dtos';

export class RoleClaimMapper {
  static toArrayResponse(entity: RoleClaim[]): RoleClaimResponseDto[] {
    return entity.map((item) => this.toResponse(item));
  }

  static toResponse(entity: RoleClaim): RoleClaimResponseDto {
    return {
      id: entity.id,
      roleId: entity.roleId,
      claimType: entity.claimType || '',
      claimValue: entity.claimValue || '',
    };
  }
}
