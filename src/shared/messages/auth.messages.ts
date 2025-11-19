export const AUTH_MESSAGES = {
  FAILED_TO_CREATE_USER: 'Failed to create user',
  EMAIL_OR_USERNAME_REQUIRED: 'Email or username is required',
  PASSWORD_REQUIRED: 'Password is required',
  USER_ALREADY_EXISTS: 'User already exists',
  UNAUTHORIZED: 'Unauthorized',
  EMAIL_NOT_CONFIRMED: 'Email is not confirmed',
  TWO_FACTOR_NOT_ENABLED: 'Two-factor authentication is not enabled',
  FAILED_TO_LOGIN: 'Failed to login',
  ACCOUNT_LOCKED: (remainingMinutes: number) =>
    `Account is locked. Try again in ${remainingMinutes} minutes.`,
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  EMAIL_ALREADY_CONFIRMED: 'Email is already confirmed',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email has been sent',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  EMAIL_CONFIRMATION_SENT: 'Email confirmation has been sent',
  EMAIL_CONFIRMED: 'Email has been confirmed successfully',
  INVALID_2FA_CODE: 'Invalid 2FA code',
  TWO_FACTOR_VERIFIED: 'Two-factor authentication verified successfully',
} as const;

export type AuthMessageKey = keyof typeof AUTH_MESSAGES;
export type AuthMessageValue = (typeof AUTH_MESSAGES)[AuthMessageKey];
