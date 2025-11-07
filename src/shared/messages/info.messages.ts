export const INFO_MESSAGES = {
  APPLICATION_RUNNING: '🚀 Application is running on:',
  SWAGGER_DOCUMENTATION: '📚 Swagger documentation:',
  UNEXPECTED_ERROR: 'Unexpected error:',
  ERROR_STARTING_APPLICATION: 'Error starting application:',
} as const;

export type InfoMessageKey = keyof typeof INFO_MESSAGES;
export type InfoMessageValue = (typeof INFO_MESSAGES)[InfoMessageKey];
