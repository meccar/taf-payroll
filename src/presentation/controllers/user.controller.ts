import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/usecases/create-user.usecase';
import { CreateUserDto } from '../../shared/dtos/user/create-user.dto';
import { MessageResponseDto } from 'src/shared/dtos/auth/message-response.dto';
import { MESSAGES } from 'src/shared/messages';

@Controller('user')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<MessageResponseDto> {
    await this.createUserUseCase.execute(createUserDto);
    return { message: MESSAGES.USER_CREATED };
  }
}
