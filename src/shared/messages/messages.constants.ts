export const MESSAGES = {
  SUCCESS: 'Success',
  CREATED_SUCCESS: 'Created successfully',
  ERROR_OCCURRED: 'An error occurred',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNKNOWN_ERROR: 'Unknown error',
  VALIDATION_FAILED: 'Validation failed',
  UNEXPECTED_ERROR: 'Unexpected error:',
  ERROR_STARTING_APPLICATION: 'Error starting application:',
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type MessageValue = (typeof MESSAGES)[MessageKey];
