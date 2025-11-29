import { BadRequestException } from '@nestjs/common';
import { UserRoleService } from 'src/application/services';
import { MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class DeleteUserRoleUseCase {
  constructor(private readonly userRoleService: UserRoleService) {}

  async execute(userId: string, roleId: string): Promise<MessageResponseDto> {
    const result = await this.userRoleService.removeFromRole(userId, roleId);

    if (!result.success)
      throw new BadRequestException(MESSAGES.ERR_DELETE_FAILED);

    return {
      message: MESSAGES.DELETED_SUCCESS,
    };
  }
}
