import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import util from 'node:util';
import { AppModule } from './app.module';
import { API, APP } from './shared/constants';
import { MESSAGES } from './shared/messages';
import { setupApp } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || APP.DEFAULT_PORT;
  const environment = configService.get<string>('NODE_ENV') || APP.DEV;

  setupApp(app);

  await app.listen(port);

  const baseUrl = `http://localhost:${port}`;
  console.log(`${MESSAGES.APPLICATION_RUNNING} ${baseUrl}`);
  if (environment !== APP.PROD)
    console.log(
      `${MESSAGES.SWAGGER_DOCUMENTATION} ${baseUrl}/${API.DOCS_PATH}`,
    );
}

bootstrap().catch((error) => {
  if (error instanceof Error) {
    console.error(`${MESSAGES.ERROR_STARTING_APPLICATION}: ${error.message}`);
    if (error.stack) console.error(error.stack);
  } else {
    const details = util.inspect(error, {
      depth: 3,
      maxArrayLength: 50,
      maxStringLength: 2000,
      breakLength: 120,
    });
    console.error(`${MESSAGES.ERROR_STARTING_APPLICATION}:`, details);
  }
  process.exit(1);
});
