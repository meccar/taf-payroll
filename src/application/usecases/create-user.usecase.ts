import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateUserDto } from 'src/shared/dtos/user/create-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserService, UserTokenService } from '../services';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { UserCreatedEvent } from '../../domain/events/user.events';
import { MessageResponseDto } from 'src/shared/dtos/auth/message-response.dto';
import { MESSAGES } from 'src/shared/messages';

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
