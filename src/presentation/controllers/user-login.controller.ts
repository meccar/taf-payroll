import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../dtos/auth/login.dto';
import { UserResponseDto } from '../dtos/user/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserService } from 'src/application/services';

@Controller('auth')
export class UserLoginController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<UserResponseDto> {
    const user = await this.userService.login(UserMapper.toEntity(loginDto));
    return UserMapper.toResponse(user);
  }
}
