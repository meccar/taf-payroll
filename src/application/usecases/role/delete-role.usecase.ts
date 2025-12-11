import { RoleAdapter } from 'src/domain/adapters';
import { MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class DeleteRoleUseCase {
  constructor(private readonly roleAdapter: RoleAdapter) {}

  async execute(roleId: string): Promise<MessageResponseDto> {
    await this.roleAdapter.delete(roleId);
    return {
      message: MESSAGES.DELETED_SUCCESS,
    };
  }
}
