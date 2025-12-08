import { UserRole } from 'src/domain/entities';
import { UserRoleResponseDto } from 'src/shared/dtos';
import { RoleMapper } from './role.mapper';

export class UserRoleMapper {
  static toArrayResponse(entity: UserRole[]): UserRoleResponseDto[] {
    return entity.map((item) => this.toResponse(item));
  }

  static toResponse(entity: UserRole): UserRoleResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      roleId: entity.roleId,
      role: RoleMapper.toResponse(entity.role),
    };
  }
}
