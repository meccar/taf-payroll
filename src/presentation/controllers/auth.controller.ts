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
import { ForgotPasswordDto } from '../../shared/dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '../../shared/dtos/auth/reset-password.dto';
import { ConfirmEmailDto } from '../../shared/dtos/auth/confirm-email.dto';
import { ResendConfirmationDto } from '../../shared/dtos/auth/resend-confirmation.dto';
import { Verify2FADto } from '../../shared/dtos/auth/verify-2fa.dto';
import { MessageResponseDto } from '../../shared/dtos/auth/message-response.dto';
import { LoginUseCase } from 'src/application/usecases/login.usecase';
import { OAuthUseCase } from 'src/application/usecases/oauth.usecase';
import { ForgotPasswordUseCase } from 'src/application/usecases/forgot-password.usecase';
import { ResetPasswordUseCase } from 'src/application/usecases/reset-password.usecase';
import { ConfirmEmailUseCase } from 'src/application/usecases/confirm-email.usecase';
import { ResendConfirmationUseCase } from 'src/application/usecases/resend-confirmation.usecase';
import { Verify2FAUseCase } from 'src/application/usecases/verify-2fa.usecase';
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
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly confirmEmailUseCase: ConfirmEmailUseCase,
    private readonly resendConfirmationUseCase: ResendConfirmationUseCase,
    private readonly verify2FAUseCase: Verify2FAUseCase,
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

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    return await this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    return await this.resetPasswordUseCase.execute(resetPasswordDto);
  }

  @Post('confirm-email')
  async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
  ): Promise<MessageResponseDto> {
    return await this.confirmEmailUseCase.execute(confirmEmailDto);
  }

  @Post('resend-confirmation')
  async resendConfirmation(
    @Body() resendConfirmationDto: ResendConfirmationDto,
  ): Promise<MessageResponseDto> {
    return await this.resendConfirmationUseCase.execute(resendConfirmationDto);
  }

  @Post('verify-2fa')
  @UseGuards(AuthGuard())
  async verify2FA(
    @Req() req: Request & { user?: { sub: string } },
    @Body() verify2FADto: Verify2FADto,
  ): Promise<MessageResponseDto> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return await this.verify2FAUseCase.execute(userId, verify2FADto);
  }
}
