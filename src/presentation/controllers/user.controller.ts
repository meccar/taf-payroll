import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserUseCase } from '../../application/use-cases/user.use-case';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UserResponseDto } from '../dtos/user/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Controller('user')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get()
  async getUsers(): Promise<UserResponseDto[]> {
    return UserMapper.toResponseList(await this.userUseCase.listUsers());
  }

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return UserMapper.toResponse(
      await this.userUseCase.createUser(UserMapper.toEntity(createUserDto)),
    );
  }
}
