export const AUTH = {
  LOCKOUT: {
    MAX_ATTEMPTS: 5,
    MINUTES: 15,
  },
} as const;

export type AuthLockoutConfig = typeof AUTH.LOCKOUT;
