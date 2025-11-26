import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import hpp from 'hpp';
import { AllExceptionsFilter } from './presentation/filters/http-exception.filter';
import { TransformInterceptor } from './presentation/interceptors/transform.interceptor';
import { API, APP, SWAGGER } from './shared/constants';

export function setupApp(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const environment = configService.get<string>('NODE_ENV') || APP.DEV;

  // Global prefix
  app.setGlobalPrefix(API.PREFIX);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API.VERSION,
  });

  // CORS Configuration
  app.enableCors({
    origin:
      environment === APP.PROD
        ? configService.get<string>('CORS_ORIGIN')?.split(',') || []
        : true,
    credentials: true,
    methods: API.CORS_METHODS,
    allowedHeaders: API.CORS_HEADERS,
  });

  // Security Middleware
  app.use(helmet());
  app.use(hpp());

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: environment === APP.PROD,
    }),
  );

  // Swagger Documentation
  if (environment !== APP.PROD) {
    const config = new DocumentBuilder()
      .setTitle(SWAGGER.TITLE)
      .setDescription(SWAGGER.DESCRIPTION)
      .setVersion(SWAGGER.VERSION)
      .addBearerAuth(
        {
          type: SWAGGER.BEARER_AUTH.TYPE,
          scheme: SWAGGER.BEARER_AUTH.SCHEME,
          bearerFormat: SWAGGER.BEARER_AUTH.BEARER_FORMAT,
          name: SWAGGER.BEARER_AUTH.NAME,
          description: SWAGGER.BEARER_DESCRIPTION,
          in: SWAGGER.BEARER_AUTH.IN,
        },
        API.BEARER_AUTH_NAME,
      )
      .addTag(SWAGGER.HEALTH_TAG, SWAGGER.HEALTH_TAG_DESCRIPTION)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(API.DOCS_PATH, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();
}
