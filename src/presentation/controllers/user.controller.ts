import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/usecases/create-user.usecase';
import { CreateUserDto } from '../../shared/dtos/user/create-user.dto';
import { UserResponseDto } from '../../shared/dtos/user/user-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.createUserUseCase.execute(createUserDto);
  }
}
