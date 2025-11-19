import { Injectable } from '@nestjs/common';
import { ConfirmEmailDto } from 'src/shared/dtos/auth/confirm-email.dto';
import { MessageResponseDto } from 'src/shared/dtos/auth/message-response.dto';
import { UserService } from '../services';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { AUTH_MESSAGES } from 'src/shared/messages/auth.messages';

@Injectable()
export class ConfirmEmailUseCase {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async execute(
    dto: ConfirmEmailDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    await this.userService.confirmEmail(dto.token, transaction);

    return {
      message: AUTH_MESSAGES.EMAIL_CONFIRMED,
    };
  }
}
