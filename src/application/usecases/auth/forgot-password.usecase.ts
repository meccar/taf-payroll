import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MESSAGES } from 'src/shared/messages';
import { ForgotPasswordDto, MessageResponseDto } from 'src/shared/dtos';
import { PasswordResetRequestedEvent } from 'src/domain/events/user.events';
import { UserAdapter, UserTokenAdapter } from 'src/domain/adapters';
import { UNIT_OF_WORK } from 'src/shared/constants';
import type { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userAdapter: UserAdapter,
    private readonly userTokenAdapter: UserTokenAdapter,
    private readonly eventEmitter: EventEmitter2,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.unitOfWork.execute<MessageResponseDto>(async () => {
      const user = await this.userAdapter.findByEmail(dto.email);
      if (!user) throw new NotFoundException(MESSAGES.ERR_USER_NOT_FOUND);

      const result = await this.userTokenAdapter.setToken(
        user.id,
        'email',
        'passwordResetToken',
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
    });
  }
}
