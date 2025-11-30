// services/oauth-provider.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ACCEPTED_OAUTH_PROVIDERS,
  AcceptedOAuthProvider,
  OAUTH_PROVIDERS,
} from '../../shared/constants/oauth.constants';

export interface OAuthProfile {
  provider: AcceptedOAuthProvider;
  providerId: string;
  email?: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photo?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  scope: string[];
}

interface GoogleProfile {
  id: string;
  displayName: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  emails?: Array<{
    value: string;
    verified: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class OAuthService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Validate if provider is accepted
   */
  validateProvider(
    provider: string,
  ): asserts provider is AcceptedOAuthProvider {
    if (!ACCEPTED_OAUTH_PROVIDERS.includes(provider as AcceptedOAuthProvider)) {
      throw new BadRequestException(
        `OAuth provider "${provider}" is not accepted. Accepted providers: ${ACCEPTED_OAUTH_PROVIDERS.join(', ')}`,
      );
    }
  }

  /**
   * Get OAuth provider configuration
   */
  getProviderConfig(provider: AcceptedOAuthProvider): OAuthProviderConfig {
    const configs: Record<AcceptedOAuthProvider, OAuthProviderConfig> = {
      [OAUTH_PROVIDERS.GOOGLE]: {
        clientId: this.configService.get('GOOGLE_CLIENT_ID') || '',
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET') || '',
        callbackURL: this.configService.get('GOOGLE_CALLBACK_URL') || '',
        scope: ['email', 'profile'],
      },
      // [OAUTH_PROVIDERS.FACEBOOK]: { ... },
      // [OAUTH_PROVIDERS.GITHUB]: { ... },
    };

    return configs[provider];
  }

  /**
   * Normalize profile from different OAuth providers to standard format
   */

  /**
   * Normalize profile from different OAuth providers to standard format
   */
  normalizeProfile(
    provider: AcceptedOAuthProvider,
    rawProfile: any,
  ): OAuthProfile {
    const normalizers: Record<
      AcceptedOAuthProvider,
      (profile: any) => OAuthProfile
    > = {
      [OAUTH_PROVIDERS.GOOGLE]: (profile: GoogleProfile): OAuthProfile => ({
        provider: OAUTH_PROVIDERS.GOOGLE,
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        emailVerified: profile.emails?.[0]?.verified ?? false,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        displayName: profile.displayName,
        photo: profile.photos?.[0]?.value,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
      }),
      // [OAUTH_PROVIDERS.FACEBOOK]: (profile: any) => ({ ... }),
      // [OAUTH_PROVIDERS.GITHUB]: (profile: any) => ({ ... }),
    };

    return normalizers[provider](rawProfile);
  }

  /**
   * Generate callback redirect URL (success)
   */
  getCallbackRedirectUrl(token: string, isNewUser: boolean = false): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    return `${frontendUrl}/auth/callback?token=${token}&isNewUser=${isNewUser}`;
  }

  /**
   * Generate callback redirect URL (error)
   */
  getCallbackErrorRedirectUrl(error: Error | string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    const errorMessage =
      error instanceof Error ? error.message : 'Authentication failed';
    return `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`;
  }

  /**
   * Validate OAuth profile has required fields
   */
  validateProfile(profile: OAuthProfile): void {
    if (!profile.email) {
      throw new BadRequestException(
        `${profile.provider} account does not have an email address`,
      );
    }

    if (!profile.providerId) {
      throw new BadRequestException(
        `${profile.provider} account does not have a valid ID`,
      );
    }
  }
}
