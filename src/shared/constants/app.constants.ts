export const APP = {
  DEFAULT_PORT: 8000,
  DEV: 'development',
  PROD: 'production',
} as const;

export type AppConfig = typeof APP;
