import { UserRoleService } from 'src/application/services';
import { MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class UpdateUserRoleUseCase {
  constructor(private readonly userRoleService: UserRoleService) {}

  async execute(userId: string, roleId: string): Promise<MessageResponseDto> {
    await this.userRoleService.updateUserRole(userId, roleId);
    return {
      message: MESSAGES.UPDATED_SUCCESS,
    };
  }
}
