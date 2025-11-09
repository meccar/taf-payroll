import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseConfig } from './database.config';
import {
  Role,
  RoleClaim,
  User,
  UserClaim,
  UserLogin,
  UserRole,
  UserToken,
} from '../../domain/entities';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
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
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
