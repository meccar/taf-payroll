import { UserRoleService } from 'src/application/services';
import { MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class AddUserToRoleUseCase {
  constructor(private readonly userRoleService: UserRoleService) {}

  async execute(userId: string, roleId: string): Promise<MessageResponseDto> {
    await this.userRoleService.addToRole(userId, roleId);
    return {
      message: MESSAGES.CREATED_SUCCESS,
    };
  }
}
