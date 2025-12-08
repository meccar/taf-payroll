import { OAuthService } from 'src/application/services';
import { OAuthCallbackDto } from 'src/shared/dtos';

export class OAuthGetCallbackErrorUseCase {
  constructor(private readonly oauthService: OAuthService) {}

  execute(error: Error | string): OAuthCallbackDto {
    return this.oauthService.getCallbackErrorRedirectUrl(error);
  }
}
