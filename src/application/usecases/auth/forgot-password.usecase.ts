import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { ForgotPasswordDto, MessageResponseDto } from 'src/shared/dtos';
import { PasswordResetRequestedEvent } from 'src/domain/events/user.events';
import { UserAdapter, UserTokenAdapter } from 'src/domain/adapters';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userAdapter: UserAdapter,
    private readonly userTokenAdapter: UserTokenAdapter,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    dto: ForgotPasswordDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    const user = await this.userAdapter.findByEmail(dto.email);
    if (!user) throw new NotFoundException(MESSAGES.ERR_USER_NOT_FOUND);

    const result = await this.userTokenAdapter.setToken(
      user.id,
      'email',
      'passwordResetToken',
      transaction,
    );

    this.eventEmitter.emit(
      'password.reset.requested',
      new PasswordResetRequestedEvent(
        result.entity.id,
        dto.email,
        result.entity.value || '',
      ),
    );

    return {
      message: MESSAGES.PASSWORD_RESET_EMAIL_SENT,
    };
  }
}
