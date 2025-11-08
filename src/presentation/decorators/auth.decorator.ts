import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import {
  AUTH_METADATA_KEY,
  AuthMetadata,
  DEFAULT_AUTH_METADATA,
} from '../auth/auth.metadata';
import { TokenResolutionOptions } from '../../application/auth';

export interface AuthOptions {
  roles?: string[];
  policies?: string[];
  requireAllRoles?: boolean;
  requireAllPolicies?: boolean;
  token?: Partial<TokenResolutionOptions>;
}

export function Auth(
  options: AuthOptions = {},
): MethodDecorator & ClassDecorator {
  const metadata: AuthMetadata = {
    roles: options.roles ?? DEFAULT_AUTH_METADATA.roles,
    policies: options.policies ?? DEFAULT_AUTH_METADATA.policies,
    requireAllRoles:
      options.requireAllRoles ?? DEFAULT_AUTH_METADATA.requireAllRoles,
    requireAllPolicies:
      options.requireAllPolicies ?? DEFAULT_AUTH_METADATA.requireAllPolicies,
    token: {
      ...DEFAULT_AUTH_METADATA.token,
      ...(options.token ?? {}),
    },
  };

  return applyDecorators(
    SetMetadata(AUTH_METADATA_KEY, metadata),
    UseGuards(AuthGuard),
  );
}
