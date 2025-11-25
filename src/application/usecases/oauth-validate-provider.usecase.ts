import { OAuthService } from '../services';
import * as oauthConstants from '../../shared/constants/oauth.constants';

export class OAuthValidateProviderUseCase {
  constructor(private readonly oauthService: OAuthService) {}

  execute(provider: oauthConstants.AcceptedOAuthProvider) {
    return this.oauthService.validateProvider(provider);
  }
}
