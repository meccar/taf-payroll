import { Injectable } from '@nestjs/common';
import { ResetPasswordDto } from 'src/shared/dtos/auth/reset-password.dto';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { UserService } from 'src/application/services';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async execute(
    dto: ResetPasswordDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    await this.userService.resetPassword(
      dto.token,
      dto.newPassword,
      transaction,
    );

    return {
      message: MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }
}
