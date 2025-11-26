export const VALIDATION_MESSAGES = {
  // COMMON
  ERR_REQUIRED: 'ERR_REQUIRED',
  ERR_MUST_BE_A_STRING: 'ERR_MUST_BE_A_STRING',
  ERR_MIN_LENGTH: 'ERR_MIN_LENGTH',
  ERR_MAX_LENGTH: 'ERR_MAX_LENGTH',
  ERR_LENGTH: 'ERR_LENGTH',

  // USER
  ERR_EMAIL_FORMAT: 'ERR_EMAIL_FORMAT',
} as const;

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
export type ValidationMessageValue =
  (typeof VALIDATION_MESSAGES)[ValidationMessageKey];
