export const ERROR_MESSAGES = {
  ERROR_OCCURRED: 'An error occurred',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNKNOWN_ERROR: 'Unknown error',
  VALIDATION_FAILED: 'Validation failed',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type ErrorMessageValue = (typeof ERROR_MESSAGES)[ErrorMessageKey];
