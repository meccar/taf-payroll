import { UserRoleMapper } from 'src/application/mappers/user-role.mapper';
import { UserRoleService } from 'src/application/services';
import { UserRoleResponseDto } from 'src/shared/dtos';

export class GetUserByRoleUseCase {
  constructor(private readonly userRoleService: UserRoleService) {}

  async execute(roleId: string): Promise<UserRoleResponseDto[]> {
    return UserRoleMapper.toArrayResponse(
      await this.userRoleService.getUsersByRole(roleId),
    );
  }
}
