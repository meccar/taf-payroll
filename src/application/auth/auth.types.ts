import { ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  roles?: string[];
  policies?: string[];
  [key: string]: unknown;
}

export interface AuthRequirements {
  roles: string[];
  policies: string[];
  requireAllRoles: boolean;
  requireAllPolicies: boolean;
}

export interface AuthService {
  authenticate(
    token: string | undefined,
    context: ExecutionContext,
  ): Promise<AuthenticatedUser | null>;
}

export const AUTH_SERVICE_TOKEN = Symbol('AUTH_SERVICE_TOKEN');

export type TokenSource = 'header' | 'cookie' | 'query';

export interface TokenResolutionOptions {
  tokenSource: TokenSource;
  headerName: string;
  cookieKey: string;
  queryParam: string;
}
