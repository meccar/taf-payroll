import { RoleAdapter } from 'src/domain/adapters';
import { MessageResponseDto, RoleDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class CreateRoleUseCase {
  constructor(private readonly roleAdapter: RoleAdapter) {}

  async execute(role: RoleDto): Promise<MessageResponseDto> {
    await this.roleAdapter.create(role);
    return {
      message: MESSAGES.CREATED_SUCCESS,
    };
  }
}
