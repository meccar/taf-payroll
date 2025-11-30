import { RoleService } from 'src/application/services';
import { MessageResponseDto, RoleDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class CreateRoleUseCase {
  constructor(private readonly roleService: RoleService) {}

  async execute(role: RoleDto): Promise<MessageResponseDto> {
    await this.roleService.createRole(role);
    return {
      message: MESSAGES.CREATED_SUCCESS,
    };
  }
}
