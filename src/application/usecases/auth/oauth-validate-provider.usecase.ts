import { OAuthService } from 'src/application/services';
import * as oauthConstants from 'src/shared/constants/oauth.constants';

export class OAuthValidateProviderUseCase {
  constructor(private readonly oauthService: OAuthService) {}

  execute(provider: oauthConstants.AcceptedOAuthProvider) {
    return this.oauthService.validateProvider(provider);
  }
}
