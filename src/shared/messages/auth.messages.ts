export const AUTH_MESSAGES = {
  FAILED_TO_CREATE_USER: 'Failed to create user',
  EMAIL_OR_USERNAME_REQUIRED: 'Email or username is required',
  PASSWORD_REQUIRED: 'Password is required',
  USER_ALREADY_EXISTS: 'User already exists',
  UNAUTHORIZED: 'Unauthorized',
  EMAIL_NOT_CONFIRMED: 'Email is not confirmed',
  TWO_FACTOR_NOT_ENABLED: 'Two-factor authentication is not enabled',
  ACCOUNT_LOCKED: (remainingMinutes: number) =>
    `Account is locked. Try again in ${remainingMinutes} minutes.`,
} as const;

export type AuthMessageKey = keyof typeof AUTH_MESSAGES;
export type AuthMessageValue = (typeof AUTH_MESSAGES)[AuthMessageKey];
