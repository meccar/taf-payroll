import { UserRoleMapper } from 'src/application/mappers/user-role.mapper';
import { UserRoleAdapter } from 'src/domain/adapters';
import { UserRoleResponseDto } from 'src/shared/dtos';

export class GetAllUserRoleUseCase {
  constructor(private readonly userRoleAdapter: UserRoleAdapter) {}

  async execute(): Promise<UserRoleResponseDto[]> {
    return UserRoleMapper.toArrayResponse(
      await this.userRoleAdapter.getAllUserRoles(),
    );
  }
}
