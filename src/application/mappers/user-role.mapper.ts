import { UserRole } from 'src/domain/entities';
import { UserRoleResponseDto } from 'src/shared/dtos';
import { RoleMapper } from './role.mapper';

export class UserRoleMapper {
  static toArrayResponse(entity: UserRole[]): UserRoleResponseDto[] {
    return entity.map((item) => {
      return {
        id: item.id,
        userId: item.userId,
        roleId: item.roleId,
        role: RoleMapper.toResponse(item.role),
      };
    });
  }
}
