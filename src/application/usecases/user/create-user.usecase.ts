import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateUserDto } from 'src/shared/dtos/user/create-user.dto';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { MESSAGES } from 'src/shared/messages';
import { UserService, UserTokenService } from 'src/application/services';
import { UserMapper } from 'src/application/mappers/user.mapper';
import { UserCreatedEvent } from 'src/domain/events/user.events';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly userTokenService: UserTokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    dto: CreateUserDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    const result = await this.userService.createUser(
      UserMapper.toEntity(dto),
      transaction,
    );

    const token = await this.userTokenService.setToken(
      result.entity.id,
      'email',
      'confirmationToken',
      result.transaction,
    );

    if (result.entity.email)
      this.eventEmitter.emit(
        'user.created',
        new UserCreatedEvent(
          result.entity.id,
          result.entity.email || '',
          token.entity.value || '',
        ),
      );

    return { message: MESSAGES.USER_CREATED };
  }
}
