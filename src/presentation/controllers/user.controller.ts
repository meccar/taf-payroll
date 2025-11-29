import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from 'src/application/usecases';
import { CreateUserDto, MessageResponseDto } from 'src/shared/dtos';
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
