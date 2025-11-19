import { Injectable } from '@nestjs/common';
import { Verify2FADto } from 'src/shared/dtos/auth/verify-2fa.dto';
import { MessageResponseDto } from 'src/shared/dtos/auth/message-response.dto';
import { UserService } from '../services';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { AUTH_MESSAGES } from 'src/shared/messages/auth.messages';

@Injectable()
export class Verify2FAUseCase {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async execute(
    userId: string,
    dto: Verify2FADto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    await this.userService.verify2FA(userId, dto.code, transaction);

    return {
      message: AUTH_MESSAGES.TWO_FACTOR_VERIFIED,
    };
  }
}
