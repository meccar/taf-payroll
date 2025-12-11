import { RoleAdapter } from 'src/domain/adapters';
import { MessageResponseDto, RoleDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class UpdateRoleUseCase {
  constructor(private readonly roleAdapter: RoleAdapter) {}

  async execute(roleId: string, role: RoleDto): Promise<MessageResponseDto> {
    await this.roleAdapter.update(roleId, role);
    return {
      message: MESSAGES.UPDATED_SUCCESS,
    };
  }
}
