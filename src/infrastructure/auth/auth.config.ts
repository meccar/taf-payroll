import { registerAs } from '@nestjs/config';
import { OAUTH_PROVIDERS } from 'src/shared/constants';

export interface PasetoConfig {
  publicKey: string;
  privateKey: string;
  audience?: string | string[];
  issuer?: string;
  clockTolerance?: string | number;
}

export interface OAuthConfig {
  provider?: string;
  clientID: string;
  clientSecret: string;
  callbackURL?: string;
}

export interface AuthConfig {
  paseto: PasetoConfig;
  oauth?: OAuthConfig;
}

const parseAudience = (rawAudience?: string): string | string[] | undefined => {
  if (!rawAudience) {
    return undefined;
  }
  const parts = rawAudience
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : parts[0];
};

export default registerAs<AuthConfig>('auth', () => ({
  paseto: {
    publicKey: process.env.PASETO_PUBLIC_KEY ?? '',
    privateKey: process.env.PASETO_PRIVATE_KEY ?? '',
    audience: parseAudience(process.env.PASETO_AUDIENCE),
    issuer: process.env.PASETO_ISSUER,
    clockTolerance: process.env.PASETO_CLOCK_TOLERANCE,
  },
  oauth: {
    provider: process.env.OAUTH_PROVIDER || OAUTH_PROVIDERS.GOOGLE,
    clientID: process.env.OAUTH_CLIENT_ID ?? '',
    clientSecret: process.env.OAUTH_CLIENT_SECRET ?? '',
    callbackURL: process.env.OAUTH_CALLBACK_URL,
  },
}));
