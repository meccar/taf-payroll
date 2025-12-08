import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database/sequelize/database.config';
import authConfig from './auth/auth.config';
import emailConfig from './email/email.config';
import { DatabaseModule } from './database/sequelize/database.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, emailConfig],
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
    EmailModule,
  ],
  exports: [DatabaseModule, AuthModule, EmailModule],
})
export class InfrastructureModule {}
