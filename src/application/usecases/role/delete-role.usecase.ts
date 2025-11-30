import { RoleService } from 'src/application/services';
import { MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class DeleteRoleUseCase {
  constructor(private readonly roleService: RoleService) {}

  async execute(roleId: string): Promise<MessageResponseDto> {
    await this.roleService.deleteRole(roleId);
    return {
      message: MESSAGES.DELETED_SUCCESS,
    };
  }
}
