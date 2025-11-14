import { Injectable } from '@nestjs/common';
import { UserResponseDto } from 'src/shared/dtos/user/user-response.dto';
import { CreateUserDto } from 'src/shared/dtos/user/create-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserService, UserTokenService } from '../services';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly userTokenService: UserTokenService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const result = await this.userService.createUser(UserMapper.toEntity(dto));
    await this.userTokenService.setToken(
      result.entity.id,
      'email',
      'confirmationToken',
      result.transaction,
    );
    return UserMapper.toResponse(result.entity);
  }
}
