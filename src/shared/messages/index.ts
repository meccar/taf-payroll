export * from './success.message';
export * from './error.message';
export * from './info.message';
export * from './repository.message';
export * from './auth.message';
export * from './validation.message';

// Combined MESSAGES object for backward compatibility
import { SUCCESS_MESSAGES } from './success.message';
import { ERROR_MESSAGES } from './error.message';
import { INFO_MESSAGES } from './info.message';
import { USER_MESSAGES } from './user.message';
import { AUTH_MESSAGES } from './auth.message';
import { REPOSITORY_MESSAGES } from './repository.message';
import { VALIDATION_MESSAGES } from './validation.message';
import { USER_ROLE_MESSAGES } from './user-role.message';

export const MESSAGES = {
  ...VALIDATION_MESSAGES,
  ...AUTH_MESSAGES,
  ...SUCCESS_MESSAGES,
  ...ERROR_MESSAGES,
  ...INFO_MESSAGES,
  ...USER_MESSAGES,
  ...REPOSITORY_MESSAGES,
  ...USER_ROLE_MESSAGES,
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type MessageValue = (typeof MESSAGES)[MessageKey];
