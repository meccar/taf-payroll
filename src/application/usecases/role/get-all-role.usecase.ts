import { RoleMapper } from 'src/application/mappers/role.mapper';
import { RoleService } from 'src/application/services';
import { RoleResponseDto } from 'src/shared/dtos';

export class GetAllRoleUseCase {
  constructor(private readonly roleService: RoleService) {}

  async execute(): Promise<RoleResponseDto[]> {
    return RoleMapper.toArrayResponse(await this.roleService.getAll());
  }
}
