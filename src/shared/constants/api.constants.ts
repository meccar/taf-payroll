export const API = {
  PREFIX: 'api',
  VERSION: '1',
  DOCS_PATH: 'api/docs',
  BEARER_AUTH_NAME: 'JWT-auth',
} as const;

export const SWAGGER = {
  TITLE: 'TAF Payroll API',
  DESCRIPTION: 'The TAF Payroll API documentation',
  VERSION: '1.0',
  BEARER_DESCRIPTION: 'Enter JWT token',
  HEALTH_TAG: 'health',
  HEALTH_TAG_DESCRIPTION: 'Health check endpoints',
} as const;

export type ApiConfig = typeof API;
export type SwaggerConfig = typeof SWAGGER;
