import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../dtos/auth/login.dto';
import { LoginResponseDto } from '../dtos/auth/login-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserService } from 'src/application/services';

@Controller('auth')
export class UserLoginController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const token = await this.userService.login(UserMapper.toEntity(loginDto));
    return { token };
  }
}
