import { RoleService } from 'src/application/services';
import { MessageResponseDto, RoleDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class UpdateRoleUseCase {
  constructor(private readonly roleService: RoleService) {}

  async execute(roleId: string, role: RoleDto): Promise<MessageResponseDto> {
    await this.roleService.updateRole(roleId, role);
    return {
      message: MESSAGES.UPDATED_SUCCESS,
    };
  }
}
