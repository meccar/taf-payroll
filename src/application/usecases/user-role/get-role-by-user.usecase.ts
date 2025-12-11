import { UserRoleMapper } from 'src/application/mappers/user-role.mapper';
import { UserRoleAdapter } from 'src/domain/adapters';
import { UserRoleResponseDto } from 'src/shared/dtos';

export class GetRoleByUserUseCase {
  constructor(private readonly userRoleAdapter: UserRoleAdapter) {}

  async execute(userId: string): Promise<UserRoleResponseDto[]> {
    return UserRoleMapper.toArrayResponse(
      await this.userRoleAdapter.getRolesByUser(userId),
    );
  }
}
