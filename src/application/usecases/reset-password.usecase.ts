import { Injectable } from '@nestjs/common';
import { ResetPasswordDto } from 'src/shared/dtos/auth/reset-password.dto';
import { MessageResponseDto } from 'src/shared/dtos/auth/message-response.dto';
import { UserService } from '../services';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { AUTH_MESSAGES } from 'src/shared/messages/auth.messages';

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
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }
}
