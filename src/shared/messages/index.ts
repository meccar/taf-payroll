export * from './success.messages';
export * from './error.messages';
export * from './info.messages';
export * from './repository.messages';
export * from './auth.messages';
export * from './validation.messages';

// Combined MESSAGES object for backward compatibility
import { SUCCESS_MESSAGES } from './success.messages';
import { ERROR_MESSAGES } from './error.messages';
import { INFO_MESSAGES } from './info.messages';
import { USER_MESSAGES } from './user.message';
import { AUTH_MESSAGES } from './auth.messages';
import { REPOSITORY_MESSAGES } from './repository.messages';
import { VALIDATION_MESSAGES } from './validation.messages';

export const MESSAGES = {
  ...VALIDATION_MESSAGES,
  ...AUTH_MESSAGES,
  ...SUCCESS_MESSAGES,
  ...ERROR_MESSAGES,
  ...INFO_MESSAGES,
  ...USER_MESSAGES,
  ...REPOSITORY_MESSAGES,
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type MessageValue = (typeof MESSAGES)[MessageKey];
