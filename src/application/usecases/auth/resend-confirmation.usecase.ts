import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResendConfirmationDto } from 'src/shared/dtos/auth/resend-confirmation.dto';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { EmailConfirmationRequestedEvent } from 'src/domain/events/user.events';
import { UserAdapter, UserTokenAdapter } from 'src/domain/adapters';

@Injectable()
export class ResendConfirmationUseCase {
  constructor(
    private readonly userAdapter: UserAdapter,
    private readonly userTokenAdapter: UserTokenAdapter,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    dto: ResendConfirmationDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    const user = await this.userAdapter.findByEmail(dto.email);
    if (!user) throw new BadRequestException(MESSAGES.ERR_USER_NOT_FOUND);

    if (user.emailConfirmed)
      throw new BadRequestException(MESSAGES.ERR_EMAIL_ALREADY_CONFIRMED);

    const result = await this.userTokenAdapter.setToken(
      user.id,
      'email',
      'confirmationToken',
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
