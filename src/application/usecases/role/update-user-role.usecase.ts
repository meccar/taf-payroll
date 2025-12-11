import { UserRoleAdapter } from 'src/domain/adapters';
import { MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class UpdateUserRoleUseCase {
  constructor(private readonly userRoleAdapter: UserRoleAdapter) {}

  async execute(userId: string, roleId: string): Promise<MessageResponseDto> {
    await this.userRoleAdapter.updateUserRole(userId, roleId);
    return {
      message: MESSAGES.UPDATED_SUCCESS,
    };
  }
}
