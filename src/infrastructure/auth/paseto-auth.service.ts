import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { V4 } from 'paseto';
import type { ExecutionContext } from '@nestjs/common';
import { AuthService, AuthenticatedUser } from '../../application/auth';
import type { AuthConfig, PasetoConfig } from './auth.config';

type PasetoClaims = Record<string, unknown> & {
  sub?: string;
  email?: string;
  roles?: unknown;
  policies?: unknown;
  iss?: string;
  aud?: unknown;
};

type PasetoValidationOptions = Partial<
  Pick<PasetoConfig, 'audience' | 'issuer' | 'clockTolerance'>
>;

type PasetoVerifyOptions = {
  audience?: string | string[];
  issuer?: string;
  clockTolerance?: string | number;
};

const pasetoV4 = V4 as {
  verify: (
    token: string,
    key: Uint8Array | Buffer,
    options?: PasetoVerifyOptions,
  ) => Promise<unknown>;
};

@Injectable()
export class PasetoAuthService implements AuthService {
  private readonly logger = new Logger(PasetoAuthService.name);
  private readonly publicKey: Uint8Array;
  private readonly config: PasetoConfig;

  constructor(private readonly configService: ConfigService) {
    const authConfig = this.configService.get<AuthConfig>('auth');
    if (!authConfig?.paseto?.publicKey) {
      throw new Error(
        'Missing PASETO configuration. Ensure PASETO_PUBLIC_KEY is set.',
      );
    }
    this.config = authConfig.paseto;
    this.publicKey = PasetoAuthService.decodePublicKey(
      authConfig.paseto.publicKey,
    );
  }

  async authenticate(
    token: string | undefined,
    context: ExecutionContext,
  ): Promise<AuthenticatedUser | null> {
    if (!token) return null;

    try {
      const validationOptions = this.resolveValidationOptions(context);
      const payload = (await pasetoV4.verify(token, this.publicKey, {
        audience: validationOptions.audience ?? this.config.audience,
        issuer: validationOptions.issuer ?? this.config.issuer,
        clockTolerance:
          validationOptions.clockTolerance ?? this.config.clockTolerance,
      })) as PasetoClaims;

      const user = this.mapClaimsToUser(payload);
      return user;
    } catch (error) {
      this.logger.debug(
        `PASETO verification failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return null;
    }
  }

  private mapClaimsToUser(payload: PasetoClaims): AuthenticatedUser | null {
    const subject = payload.sub;
    if (typeof subject !== 'string' || subject.length === 0) return null;

    const rawRoles = Array.isArray(payload.roles) ? payload.roles : [];
    const rawPolicies = Array.isArray(payload.policies) ? payload.policies : [];

    const roles = rawRoles.filter(
      (role): role is string => typeof role === 'string',
    );
    const policies = rawPolicies.filter(
      (policy): policy is string => typeof policy === 'string',
    );
    const issuer = typeof payload.iss === 'string' ? payload.iss : undefined;
    const audienceClaim = payload.aud;
    const audiences = Array.isArray(audienceClaim)
      ? audienceClaim.filter(
          (value): value is string => typeof value === 'string',
        )
      : typeof audienceClaim === 'string'
        ? [audienceClaim]
        : [];

    const user: AuthenticatedUser = {
      id: subject,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      roles,
      policies,
      issuer,
      audience: audiences.length > 0 ? audiences : undefined,
    };

    const reservedClaims = new Set([
      'sub',
      'email',
      'roles',
      'policies',
      'exp',
      'nbf',
      'iat',
    ]);

    for (const [key, value] of Object.entries(payload)) {
      if (reservedClaims.has(key)) continue;
      user[key] = value;
    }

    return user;
  }

  private resolveValidationOptions(
    context: ExecutionContext,
  ): PasetoValidationOptions {
    const request = context
      .switchToHttp()
      .getRequest<{ __pasetoValidationOptions?: PasetoValidationOptions }>();
    return request?.__pasetoValidationOptions ?? {};
  }

  private static decodePublicKey(key: string): Uint8Array {
    const attempts: BufferEncoding[] = ['base64url', 'base64'];
    for (const encoding of attempts) {
      try {
        const buffer = Buffer.from(key, encoding);
        if (buffer.length > 0) {
          return new Uint8Array(buffer);
        }
      } catch {
        // continue trying other encodings
      }
    }
    throw new Error(
      'Failed to decode PASETO public key. Provide base64/base64url string.',
    );
  }
}
