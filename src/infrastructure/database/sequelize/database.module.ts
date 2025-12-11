import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseConfig } from './database.config';

import { SequelizeUnitOfWork } from './unit-of-work';
import { UNIT_OF_WORK } from 'src/shared/constants';
import {
  Audit,
  Role,
  RoleClaim,
  User,
  UserClaim,
  UserLogin,
  UserRole,
  UserToken,
} from './models';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        if (!dbConfig) throw new Error('Database configuration not found');
        return {
          dialect: dbConfig.dialect,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          autoLoadModels: dbConfig.autoLoadModels,
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          pool: dbConfig.pool,
          define: {
            timestamps: true,
            underscored: true,
            paranoid: true,
            freezeTableName: false,
          },
          dialectOptions: {
            ssl:
              process.env.DB_SSL === 'true'
                ? {
                    require: true,
                    rejectUnauthorized: false,
                  }
                : false,
          },
          models: [
            User,
            Role,
            UserRole,
            RoleClaim,
            UserClaim,
            UserLogin,
            UserToken,
            Audit,
          ],
        };
      },
    }),
  ],
  providers: [
    {
      provide: UNIT_OF_WORK,
      useClass: SequelizeUnitOfWork,
    },
  ],
  exports: [SequelizeModule, UNIT_OF_WORK],
})
export class DatabaseModule {}
