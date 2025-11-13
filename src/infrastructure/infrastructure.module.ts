import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database/database.config';
import authConfig from './auth/auth.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
  exports: [DatabaseModule, AuthModule],
})
export class InfrastructureModule {}
