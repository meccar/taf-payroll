import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { ForgotPasswordDto, MessageResponseDto } from 'src/shared/dtos';
import { UserService } from 'src/application/services';
import { PasswordResetRequestedEvent } from 'src/domain/events/user.events';

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
      message: MESSAGES.PASSWORD_RESET_EMAIL_SENT,
    };
  }
}
