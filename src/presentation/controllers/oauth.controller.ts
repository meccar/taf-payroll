import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OAuthCallbackUseCase } from 'src/application/usecases';
import { OAuthGetCallbackErrorUseCase } from 'src/application/usecases/auth/oauth-get-callback-error.usecase';
import { OAuthValidateProviderUseCase } from 'src/application/usecases/auth/oauth-validate-provider.usecase';
import { OAUTH_PROVIDERS } from 'src/shared/constants';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly oauthCallbackUseCase: OAuthCallbackUseCase,
    private readonly oauthGetCallbackErrorUseCase: OAuthGetCallbackErrorUseCase,
    private readonly oauthValidateProviderUseCase: OAuthValidateProviderUseCase,
  ) {}

  @Get(`${OAUTH_PROVIDERS.GOOGLE}/callback`)
  @UseGuards(AuthGuard(OAUTH_PROVIDERS.GOOGLE))
  async googleCallback(@Req() req: Request & { user?: any }) {
    return await this.oauthCallbackUseCase.execute(
      OAUTH_PROVIDERS.GOOGLE,
      req.user,
    );
  }

  @Get(`${OAUTH_PROVIDERS.GOOGLE}/error`)
  error() {
    return this.oauthGetCallbackErrorUseCase.execute(OAUTH_PROVIDERS.GOOGLE);
  }

  @Get(`${OAUTH_PROVIDERS.GOOGLE}/validate`)
  validate() {
    return this.oauthValidateProviderUseCase.execute(OAUTH_PROVIDERS.GOOGLE);
  }
}
