export * from './success.messages';
export * from './error.messages';
export * from './info.messages';
export * from './repository.messages';

// Combined MESSAGES object for backward compatibility
import { SUCCESS_MESSAGES } from './success.messages';
import { ERROR_MESSAGES } from './error.messages';
import { INFO_MESSAGES } from './info.messages';

export const MESSAGES = {
  ...SUCCESS_MESSAGES,
  ...ERROR_MESSAGES,
  ...INFO_MESSAGES,
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type MessageValue = (typeof MESSAGES)[MessageKey];
