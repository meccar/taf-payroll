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
  const environment = configService.get<string>('NODE_ENV') || APP.DEFAULT_ENV;

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
      environment === 'production'
        ? configService.get<string>('CORS_ORIGIN')?.split(',') || []
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
      disableErrorMessages: environment === 'production',
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
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(SWAGGER.TITLE)
      .setDescription(SWAGGER.DESCRIPTION)
      .setVersion(SWAGGER.VERSION)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: SWAGGER.BEARER_DESCRIPTION,
          in: 'header',
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

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (environment !== 'production') {
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((error) => {
  console.error(`${MESSAGES.ERROR_STARTING_APPLICATION}`, error);
  process.exit(1);
});
