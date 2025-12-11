import { BadRequestException } from '@nestjs/common';
import { UserRoleAdapter } from 'src/domain/adapters';
import { MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';

export class DeleteUserRoleUseCase {
  constructor(private readonly userRoleAdapter: UserRoleAdapter) {}

  async execute(userId: string, roleId: string): Promise<MessageResponseDto> {
    const result = await this.userRoleAdapter.removeFromRole(userId, roleId);

    if (!result.success)
      throw new BadRequestException(MESSAGES.ERR_DELETE_FAILED);

    return {
      message: MESSAGES.DELETED_SUCCESS,
    };
  }
}
