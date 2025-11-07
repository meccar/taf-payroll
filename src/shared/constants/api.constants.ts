export const API = {
  PREFIX: 'api',
  VERSION: '1',
  DOCS_PATH: 'api/docs',
  BEARER_AUTH_NAME: 'JWT-auth',
  CORS_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const,
  CORS_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'] as const,
} as const;

export const SWAGGER = {
  TITLE: 'TAF Payroll API',
  DESCRIPTION: 'The TAF Payroll API documentation',
  VERSION: '1.0',
  BEARER_DESCRIPTION: 'Enter JWT token',
  HEALTH_TAG: 'health',
  HEALTH_TAG_DESCRIPTION: 'Health check endpoints',
  BEARER_AUTH: {
    TYPE: 'http',
    SCHEME: 'bearer',
    BEARER_FORMAT: 'JWT',
    NAME: 'JWT',
    IN: 'header',
  } as const,
} as const;

export type ApiConfig = typeof API;
export type SwaggerConfig = typeof SWAGGER;
