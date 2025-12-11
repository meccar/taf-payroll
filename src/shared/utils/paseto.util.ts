import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { V4 } from 'paseto';
import type { PasetoSignOptions } from 'paseto';
import type { PasetoConfig } from '../../infrastructure/auth/auth.config';

const pasetoV4 = V4 as {
  sign: (
    payload: Record<string, unknown>,
    key: Uint8Array | Buffer,
    options?: PasetoSignOptions,
  ) => Promise<string>;
};

export async function generatePasetoToken(
  configService: ConfigService,
  payload: Record<string, unknown>,
): Promise<string> {
  const privateKeyBase64 = configService.getOrThrow<string>(
    'auth.paseto.privateKey',
    { infer: true },
  );

  if (!privateKeyBase64) {
    throw new InternalServerErrorException(
      'PASETO private key is not configured',
    );
  }

  const privateKey = decodeKey(privateKeyBase64);

  const audience = configService.get<PasetoConfig['audience']>(
    'auth.paseto.audience',
    { infer: true },
  );
  const issuer = configService.get<string>('auth.paseto.issuer', {
    infer: true,
  });

  return await pasetoV4.sign(payload, privateKey, {
    audience,
    issuer,
  });
}

export function decodeKey(key: string): Uint8Array {
  const attempts: BufferEncoding[] = ['base64url', 'base64'];

  for (const encoding of attempts) {
    try {
      const buffer = Buffer.from(key, encoding);
      if (buffer.length > 0) {
        return new Uint8Array(buffer);
      }
    } catch {
      // continue to next encoding
    }
  }

  throw new InternalServerErrorException(
    'Unable to decode PASETO private key. Provide a valid base64/base64url string.',
  );
}

export function buildPasetoPayload(
  userId: string,
  email: string | null,
  roleNames: string[],
  policyClaims: string[],
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    sub: userId,
  };

  if (email) payload.email = email;
  if (roleNames.length > 0) payload.roles = roleNames;
  if (policyClaims.length > 0) payload.policies = policyClaims;

  return payload;
}
