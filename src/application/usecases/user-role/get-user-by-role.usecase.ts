import { UserRoleMapper } from 'src/application/mappers/user-role.mapper';
import { UserRoleAdapter } from 'src/domain/adapters';
import { UserRoleResponseDto } from 'src/shared/dtos';

export class GetUserByRoleUseCase {
  constructor(private readonly userRoleAdapter: UserRoleAdapter) {}

  async execute(roleId: string): Promise<UserRoleResponseDto[]> {
    return UserRoleMapper.toArrayResponse(
      await this.userRoleAdapter.getUsersByRole(roleId),
    );
  }
}
