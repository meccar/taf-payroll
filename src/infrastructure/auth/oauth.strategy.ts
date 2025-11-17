import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthConfig } from './auth.config';
import {
  ACCEPTED_OAUTH_PROVIDERS,
  AcceptedOAuthProvider,
  OAUTH_PROVIDERS,
} from '../../shared/constants/oauth.constants';

@Injectable()
export class OAuthStrategy extends PassportStrategy(
  Strategy,
  OAUTH_PROVIDERS.GOOGLE,
) {
  constructor(private readonly configService: ConfigService) {
    const authConfig = configService.get<AuthConfig>('auth');
    const oauthConfig = authConfig?.oauth;

    if (!oauthConfig?.clientID || !oauthConfig?.clientSecret)
      throw new Error(
        'Missing OAuth configuration. Ensure OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET are set.',
      );

    const provider = oauthConfig.provider || OAUTH_PROVIDERS.GOOGLE;
    if (!ACCEPTED_OAUTH_PROVIDERS.includes(provider as AcceptedOAuthProvider))
      throw new Error(
        `OAuth provider "${provider}" is not accepted. Accepted providers: ${ACCEPTED_OAUTH_PROVIDERS.join(', ')}`,
      );

    super({
      clientID: oauthConfig.clientID,
      clientSecret: oauthConfig.clientSecret,
      callbackURL: oauthConfig.callbackURL || '/auth/oauth/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      displayName?: string;
      name?: {
        familyName?: string;
        givenName?: string;
      };
      emails?: Array<{ value: string; verified?: boolean }>;
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): void {
    const { id, displayName, name, emails, photos } = profile;
    const authConfig = this.configService.get<AuthConfig>('auth');
    const provider = authConfig?.oauth?.provider || OAUTH_PROVIDERS.GOOGLE;

    const user = {
      provider,
      providerId: id,
      email: emails?.[0]?.value,
      emailVerified: emails?.[0]?.verified ?? false,
      firstName: name?.givenName || displayName?.split(' ')[0],
      lastName: name?.familyName || displayName?.split(' ').slice(1).join(' '),
      displayName:
        displayName ||
        `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
      photo: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
