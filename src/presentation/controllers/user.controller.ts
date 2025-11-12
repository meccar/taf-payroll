import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UserResponseDto } from '../dtos/user/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserResponseDto[]> {
    return UserMapper.toResponseList(await this.userService.getUsers());
  }

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return UserMapper.toResponse(
      await this.userService.createUser(UserMapper.toEntity(createUserDto)),
    );
  }
}
