import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserResponseDto } from 'src/shared/dtos/user/user-response.dto';
import { CreateUserDto } from 'src/shared/dtos/user/create-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserService, UserTokenService } from '../services';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { UserCreatedEvent } from '../../domain/events/user.events';

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
  ): Promise<UserResponseDto> {
    const result = await this.userService.createUser(
      UserMapper.toEntity(dto),
      transaction,
    );

    const token = await this.userTokenService.setToken(
      result.id,
      'email',
      'confirmationToken',
      transaction,
    );

    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(result.id, result.email || '', token.value || ''),
    );

    return UserMapper.toResponse(result);
  }
}
