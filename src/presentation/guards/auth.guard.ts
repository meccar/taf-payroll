import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AUTH_SERVICE_TOKEN, AuthRequirements } from '../../application/auth';
import type {
  AuthService,
  AuthenticatedUser,
  TokenResolutionOptions,
} from '../../application/auth';
import {
  AUTH_METADATA_KEY,
  AuthMetadata,
  DEFAULT_AUTH_METADATA,
} from '../auth/auth.metadata';
import type {
  AuthConfig,
  PasetoConfig,
} from '../../infrastructure/auth/auth.config';

type CookieBag = Record<string, string | undefined>;

type PasetoValidationOptions = {
  audience?: string | string[];
  issuer?: string;
  clockTolerance?: string | number;
};

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
  cookies?: CookieBag;
  __pasetoValidationOptions?: PasetoValidationOptions;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<AuthMetadata | undefined>(
      AUTH_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const validationOptions = this.buildValidationOptions(metadata);
    request.__pasetoValidationOptions = validationOptions;

    const token = this.extractToken(
      request,
      metadata?.token ?? DEFAULT_AUTH_METADATA.token,
    );

    const user = await this.authService.authenticate(token, context);
    if (!user) throw new UnauthorizedException('Authentication failed');

    this.attachUser(request, user);

    const requirements: AuthRequirements = {
      roles: metadata?.roles ?? DEFAULT_AUTH_METADATA.roles,
      policies: metadata?.policies ?? DEFAULT_AUTH_METADATA.policies,
      requireAllRoles:
        metadata?.requireAllRoles ?? DEFAULT_AUTH_METADATA.requireAllRoles,
      requireAllPolicies:
        metadata?.requireAllPolicies ??
        DEFAULT_AUTH_METADATA.requireAllPolicies,
    };

    this.ensureAuthorization(user, requirements);
    this.ensureTokenConstraints(user, validationOptions);

    return true;
  }

  private extractToken(
    request: RequestWithUser,
    options: TokenResolutionOptions,
  ): string | undefined {
    if (options.tokenSource === 'cookie')
      return this.extractFromCookie(request, options.cookieKey);

    if (options.tokenSource === 'query')
      return this.extractFromQuery(request, options.queryParam);

    return this.extractFromHeader(request, options.headerName);
  }

  private attachUser(request: RequestWithUser, user: AuthenticatedUser): void {
    request.user = user;
  }

  private extractFromCookie(
    request: RequestWithUser,
    cookieKey: string,
  ): string | undefined {
    const requestWithCookies = request as Request & { cookies?: unknown };
    const cookiesCandidate: unknown = requestWithCookies.cookies;
    if (!cookiesCandidate || typeof cookiesCandidate !== 'object')
      return undefined;
    const cookies = cookiesCandidate as Record<string, unknown>;
    const value = cookies[cookieKey];
    return typeof value === 'string' ? value : undefined;
  }

  private extractFromQuery(
    request: Request,
    queryParam: string,
  ): string | undefined {
    const value = request.query?.[queryParam];
    if (Array.isArray(value)) return value[0] as string | undefined;
    if (typeof value === 'string') return value;
    return undefined;
  }

  private extractFromHeader(
    request: Request,
    headerName: string,
  ): string | undefined {
    const headerValue = request.headers[headerName];
    if (!headerValue) return undefined;

    const rawValue = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const [scheme, token] = rawValue.split(' ');

    if (token && /^bearer$/i.test(scheme)) return token;

    return rawValue;
  }

  private ensureAuthorization(
    user: AuthenticatedUser,
    requirements: AuthRequirements,
  ): void {
    if (!this.satisfiesRoles(user, requirements))
      throw new ForbiddenException('Missing required roles');

    if (!this.satisfiesPolicies(user, requirements))
      throw new ForbiddenException('Missing required policies');
  }

  private satisfiesRoles(
    user: AuthenticatedUser,
    requirements: AuthRequirements,
  ): boolean {
    if (requirements.roles.length === 0) return true;

    const userRoles = new Set(user.roles ?? []);
    if (requirements.requireAllRoles)
      return requirements.roles.every((role) => userRoles.has(role));

    return requirements.roles.some((role) => userRoles.has(role));
  }

  private satisfiesPolicies(
    user: AuthenticatedUser,
    requirements: AuthRequirements,
  ): boolean {
    if (requirements.policies.length === 0) return true;

    const userPolicies = new Set(user.policies ?? []);
    if (requirements.requireAllPolicies)
      return requirements.policies.every((policy) => userPolicies.has(policy));

    return requirements.policies.some((policy) => userPolicies.has(policy));
  }

  private buildValidationOptions(
    metadata?: AuthMetadata,
  ): PasetoValidationOptions {
    const pasetoConfig =
      this.configService.get<PasetoConfig>('auth.paseto') ??
      this.configService.get<AuthConfig>('auth')?.paseto;

    return {
      audience: metadata?.audience ?? pasetoConfig?.audience,
      issuer: metadata?.issuer ?? pasetoConfig?.issuer,
      clockTolerance: metadata?.clockTolerance ?? pasetoConfig?.clockTolerance,
    };
  }

  private ensureTokenConstraints(
    user: AuthenticatedUser,
    options: PasetoValidationOptions,
  ): void {
    if (options.issuer) {
      const issuer = (user as Record<string, unknown>).issuer ?? user['iss'];
      if (issuer !== options.issuer)
        throw new ForbiddenException('Token issued by an unauthorized issuer');
    }

    if (!options.audience) return;

    const expectedAudiences = Array.isArray(options.audience)
      ? options.audience
      : [options.audience];

    const audienceValue =
      (user as Record<string, unknown>).audience ?? user['aud'];
    const userAudiences = Array.isArray(audienceValue)
      ? audienceValue
      : audienceValue
        ? [audienceValue]
        : [];

    const hasRequiredAudience = expectedAudiences.every((audience) =>
      userAudiences.includes(audience),
    );

    if (!hasRequiredAudience)
      throw new ForbiddenException('Token intended for a different audience');
  }
}
