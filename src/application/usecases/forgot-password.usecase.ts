import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForgotPasswordDto } from 'src/shared/dtos/auth/forgot-password.dto';
import { MessageResponseDto } from 'src/shared/dtos/auth/message-response.dto';
import { UserService } from '../services';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { PasswordResetRequestedEvent } from '../../domain/events/user.events';
import { AUTH_MESSAGES } from 'src/shared/messages/auth.messages';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    dto: ForgotPasswordDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    const result = await this.userService.requestPasswordReset(
      dto.email,
      transaction,
    );

    this.eventEmitter.emit(
      'password.reset.requested',
      new PasswordResetRequestedEvent(
        result.entity.userId,
        dto.email,
        result.entity.value || '',
      ),
    );

    return {
      message: AUTH_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
    };
  }
}
