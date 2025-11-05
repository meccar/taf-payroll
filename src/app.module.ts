import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import databaseConfig from './infrastructure/database/database.config';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),
    // Database Module
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
