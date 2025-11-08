import { TokenResolutionOptions } from '../../application/auth';

export interface AuthMetadata {
  roles: string[];
  policies: string[];
  requireAllRoles: boolean;
  requireAllPolicies: boolean;
  token: TokenResolutionOptions;
}

export const AUTH_METADATA_KEY = 'auth:metadata';

export const DEFAULT_AUTH_METADATA: AuthMetadata = {
  roles: [],
  policies: [],
  requireAllRoles: true,
  requireAllPolicies: true,
  token: {
    tokenSource: 'header',
    headerName: 'authorization',
    cookieKey: 'access_token',
    queryParam: 'access_token',
  },
};
