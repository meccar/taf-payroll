import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/filters/http-exception.filter';
import { TransformInterceptor } from './presentation/interceptors/transform.interceptor';
import { BadRequestException } from '@nestjs/common';
import { API, SWAGGER, APP } from './shared/constants';
import { MESSAGES } from './shared/messages';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || APP.DEFAULT_PORT;
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
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce(
          (acc, error) => {
            acc[error.property] = Object.values(error.constraints || {});
            return acc;
          },
          {} as Record<string, string[]>,
        );

        return new BadRequestException({
          message: MESSAGES.VALIDATION_FAILED,
          errors: formattedErrors,
        });
      },
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

  await app.listen(port);

  const baseUrl = `http://localhost:${port}`;
  console.log(`${MESSAGES.APPLICATION_RUNNING} ${baseUrl}`);
  if (environment !== APP.PROD)
    console.log(
      `${MESSAGES.SWAGGER_DOCUMENTATION} ${baseUrl}/${API.DOCS_PATH}`,
    );
}

bootstrap().catch((error) => {
  console.error(`${MESSAGES.ERROR_STARTING_APPLICATION}`, error);
  process.exit(1);
});
