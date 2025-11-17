import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AcceptedOAuthProvider } from '../../shared/constants/oauth.constants';
import { LoginDto } from '../../shared/dtos/auth/login.dto';
import { LoginResponseDto } from '../../shared/dtos/auth/login-response.dto';
import { LoginUseCase } from 'src/application/usecases/login.usecase';
import { OAuthUseCase } from 'src/application/usecases/oauth.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly oauthUseCase: OAuthUseCase,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return {
      token: await this.loginUseCase.execute(loginDto),
    };
  }

  @Get('oauth')
  @UseGuards(AuthGuard('google'))
  async oauth() {
    // Initiates OAuth flow
  }

  @Get('oauth/callback')
  @UseGuards(AuthGuard('google'))
  async oauthCallback(
    @Req() req: Request & { user?: unknown },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const oauthUser = req.user as {
        provider: AcceptedOAuthProvider;
        providerId: string;
        email?: string;
        emailVerified: boolean;
        displayName?: string;
        accessToken: string;
        refreshToken?: string;
      };

      const token = await this.oauthUseCase.execute(oauthUser);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Authentication failed',
        )}`,
      );
    }
  }
}
