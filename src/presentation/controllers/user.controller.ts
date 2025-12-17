import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from 'src/application/usecases';
import { CreateUserDto, MessageResponseDto } from 'src/shared/dtos';

@Controller('user')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<MessageResponseDto> {
    return await this.createUserUseCase.execute(createUserDto);
  }
}
