import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseConfig } from './database.config';

import { SequelizeUnitOfWork } from './unit-of-work';
import { UNIT_OF_WORK } from 'src/shared/constants';
import {
  AuditAdapter,
  RoleAdapter,
  RoleClaimAdapter,
  UserAdapter,
  UserClaimAdapter,
  UserLoginAdapter,
  UserRoleAdapter,
  UserTokenAdapter,
} from 'src/domain/adapters';
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
import { AuditRepository } from './repositories/audit.repository';
import { RoleClaimRepository } from './repositories/role-claim.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserClaimRepository } from './repositories/user-claim.repository';
import { UserLoginRepository } from './repositories/user-login.repository';
import { UserRepository } from './repositories/user.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserTokenRepository } from './repositories/user-token.repository';

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
          logging: false,
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
    UserRepository,
    RoleRepository,
    UserRoleRepository,
    RoleClaimRepository,
    UserClaimRepository,
    UserLoginRepository,
    UserTokenRepository,
    AuditRepository,
    { provide: UserAdapter, useExisting: UserRepository },
    { provide: RoleAdapter, useExisting: RoleRepository },
    { provide: UserRoleAdapter, useExisting: UserRoleRepository },
    { provide: RoleClaimAdapter, useExisting: RoleClaimRepository },
    { provide: UserClaimAdapter, useExisting: UserClaimRepository },
    { provide: UserLoginAdapter, useExisting: UserLoginRepository },
    { provide: UserTokenAdapter, useExisting: UserTokenRepository },
    { provide: AuditAdapter, useExisting: AuditRepository },
  ],
  exports: [
    SequelizeModule,
    UNIT_OF_WORK,
    UserAdapter,
    RoleAdapter,
    UserRoleAdapter,
    RoleClaimAdapter,
    UserClaimAdapter,
    UserLoginAdapter,
    UserTokenAdapter,
    AuditAdapter,
  ],
})
export class DatabaseModule {}
