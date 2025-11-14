import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../../shared/dtos/auth/login.dto';
import { LoginResponseDto } from '../../shared/dtos/auth/login-response.dto';
import { LoginUseCase } from 'src/application/usecases/login.usecase';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return {
      token: await this.loginUseCase.execute(loginDto),
    };
  }
}
