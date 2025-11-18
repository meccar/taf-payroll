import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import * as oauthConstants from '../../shared/constants/oauth.constants';
import { LoginDto } from '../../shared/dtos/auth/login.dto';
import { LoginResponseDto } from '../../shared/dtos/auth/login-response.dto';
import { LoginUseCase } from 'src/application/usecases/login.usecase';
import { OAuthUseCase } from 'src/application/usecases/oauth.usecase';
import {
  OAuthService,
  type OAuthUser,
} from 'src/application/services/oauth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly oauthUseCase: OAuthUseCase,
    private readonly oauthService: OAuthService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return {
      token: await this.loginUseCase.execute(loginDto),
    };
  }

  @Get('oauth/:provider')
  @UseGuards(AuthGuard())
  oauth(
    @Param('provider') provider: oauthConstants.AcceptedOAuthProvider,
  ): void {
    this.oauthService.validateProvider(provider);
  }

  @Get('oauth/:provider/callback')
  @UseGuards(AuthGuard())
  async oauthCallback(
    @Param('provider') provider: oauthConstants.AcceptedOAuthProvider,
    @Req() req: Request & { user?: unknown },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const oauthUser = req.user as OAuthUser | null;
      const token = await this.oauthUseCase.executeCallback(
        oauthUser,
        provider,
      );
      const redirectUrl = this.oauthService.getCallbackRedirectUrl(token);
      res.redirect(redirectUrl);
    } catch (error: unknown) {
      const errorRedirectUrl = this.oauthService.getCallbackErrorRedirectUrl(
        error as Error,
      );
      res.redirect(errorRedirectUrl);
    }
  }
}
