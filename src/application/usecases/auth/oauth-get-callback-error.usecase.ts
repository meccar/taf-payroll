import { OAuthService } from 'src/application/services';

export class OAuthGetCallbackErrorUseCase {
  constructor(private readonly oauthService: OAuthService) {}

  execute(error: Error | string): string {
    return this.oauthService.getCallbackErrorRedirectUrl(error);
  }
}
