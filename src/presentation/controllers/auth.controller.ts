import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from 'src/application/services';
import { LoginDto } from '../dtos/auth/login.dto';
import { LoginResponseDto } from '../dtos/auth/login-response.dto';
import { AuthMapper } from '../mappers/auth.mapper';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return AuthMapper.toResponse(
      await this.userService.login(AuthMapper.toEntity(loginDto)),
    );
  }
}
