export const APP = {
  DEFAULT_PORT: 3000,
  DEFAULT_ENV: 'development',
} as const;

export type AppConfig = typeof APP;
