import { registerAs } from '@nestjs/config';

export interface PasetoConfig {
  publicKey: string;
  privateKey: string;
  audience?: string | string[];
  issuer?: string;
  clockTolerance?: string | number;
}

export interface AuthConfig {
  paseto: PasetoConfig;
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
}));
