import { UserRoleMapper } from 'src/application/mappers/user-role.mapper';
import { UserRoleService } from 'src/application/services';
import { UserRoleResponseDto } from 'src/shared/dtos';

export class GetRoleByUserUseCase {
  constructor(private readonly userRoleService: UserRoleService) {}

  async execute(userId: string): Promise<UserRoleResponseDto[]> {
    return UserRoleMapper.toArrayResponse(
      await this.userRoleService.getRolesByUser(userId),
    );
  }
}
