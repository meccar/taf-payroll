import { AcceptedOAuthProvider } from '../constants';

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

export interface GoogleProfile {
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
