import { Controller, Get } from '@nestjs/common';
import { OAuthGetCallbackErrorUseCase } from 'src/application/usecases/auth/oauth-get-callback-error.usecase';
import { OAuthValidateProviderUseCase } from 'src/application/usecases/auth/oauth-validate-provider.usecase';
import { OAUTH_PROVIDERS } from 'src/shared/constants';

@Controller('auth/oauth')
export class OAuthController {
  constructor(
    // private readonly oauthCallbackUseCase: OAuthCallbackUseCase,
    private readonly oauthGetCallbackErrorUseCase: OAuthGetCallbackErrorUseCase,
    private readonly oauthValidateProviderUseCase: OAuthValidateProviderUseCase,
  ) {}

  // @Get(`${OAUTH_PROVIDERS.GOOGLE}/callback`)
  // @UseGuards(AuthGuard(OAUTH_PROVIDERS.GOOGLE))
  // async googleCallback(
  //   @Req() req: Request,
  // ) {
  //     return this.oauthCallbackUseCase.execute(OAUTH_PROVIDERS.GOOGLE, req.user);
  // }

  @Get(`${OAUTH_PROVIDERS.GOOGLE}/error`)
  error() {
    return this.oauthGetCallbackErrorUseCase.execute(OAUTH_PROVIDERS.GOOGLE);
  }

  @Get(`${OAUTH_PROVIDERS.GOOGLE}/validate`)
  validate() {
    return this.oauthValidateProviderUseCase.execute(OAUTH_PROVIDERS.GOOGLE);
  }
}
