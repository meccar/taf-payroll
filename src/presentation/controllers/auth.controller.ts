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
import { CurrentUser } from '../decorators';
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
import { OAuthCallbackUseCase } from 'src/application/usecases/oauth-callback.usecase';
import { ForgotPasswordUseCase } from 'src/application/usecases/forgot-password.usecase';
import { ResetPasswordUseCase } from 'src/application/usecases/reset-password.usecase';
import { ConfirmEmailUseCase } from 'src/application/usecases/confirm-email.usecase';
import { ResendConfirmationUseCase } from 'src/application/usecases/resend-confirmation.usecase';
import { Verify2FAUseCase } from 'src/application/usecases/verify-2fa.usecase';
import { type OAuthUser } from 'src/application/services/oauth.service';
import { User } from 'src/domain/entities';
import { OAuthGetCallbackErrorUseCase } from 'src/application/usecases/oauth-get-callback-error.usecase';
import { OAuthValidateProviderUseCase } from 'src/application/usecases/oauth-validate-provider.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly oauthCallbackUseCase: OAuthCallbackUseCase,
    private readonly oauthGetCallbackErrorUseCase: OAuthGetCallbackErrorUseCase,
    private readonly oauthValidateProviderUseCase: OAuthValidateProviderUseCase,
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
    this.oauthValidateProviderUseCase.execute(provider);
  }

  @Get('oauth/:provider/callback')
  @UseGuards(AuthGuard())
  async oauthCallback(
    @Param('provider') provider: oauthConstants.AcceptedOAuthProvider,
    @Req() req: Request & { user?: OAuthUser },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const redirectUrl = await this.oauthCallbackUseCase.executeCallback(
        req.user,
        provider,
      );

      res.redirect(redirectUrl);
    } catch (error: unknown) {
      const errorRedirectUrl = this.oauthGetCallbackErrorUseCase.execute(
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
    @CurrentUser() user: User | null,
    @Body() verify2FADto: Verify2FADto,
  ): Promise<MessageResponseDto> {
    return await this.verify2FAUseCase.execute(user, verify2FADto);
  }
}
