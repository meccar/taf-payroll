import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResendConfirmationDto } from 'src/shared/dtos/auth/resend-confirmation.dto';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { UserService } from 'src/application/services';
import { EmailConfirmationRequestedEvent } from 'src/domain/events/user.events';

@Injectable()
export class ResendConfirmationUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    dto: ResendConfirmationDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    const result = await this.userService.resendEmailConfirmation(
      dto.email,
      transaction,
    );

    this.eventEmitter.emit(
      'email.confirmation.requested',
      new EmailConfirmationRequestedEvent(
        result.entity.userId,
        dto.email,
        result.entity.value || '',
      ),
    );

    return {
      message: MESSAGES.EMAIL_CONFIRMATION_SENT,
    };
  }
}
