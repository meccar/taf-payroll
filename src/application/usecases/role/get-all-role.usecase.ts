import { RoleMapper } from 'src/application/mappers/role.mapper';
import { RoleAdapter } from 'src/domain/adapters';
import { RoleResponseDto } from 'src/shared/dtos';

export class GetAllRoleUseCase {
  constructor(private readonly roleAdapter: RoleAdapter) {}

  async execute(): Promise<RoleResponseDto[]> {
    return RoleMapper.toArrayResponse(await this.roleAdapter.getAll());
  }
}
