export const APP = {
  DEFAULT_PORT: 3000,
  DEV: 'development',
  PROD: 'production',
} as const;

export type AppConfig = typeof APP;
