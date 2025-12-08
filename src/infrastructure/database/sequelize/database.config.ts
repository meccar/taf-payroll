import { registerAs } from '@nestjs/config';
import { Dialect } from 'sequelize';

export interface DatabaseConfig {
  dialect: Dialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean | ((sql: string, timing?: number) => void);
  autoLoadModels: boolean;
  synchronizeModels: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  retry: {
    max: number;
  };
}

export default registerAs<DatabaseConfig>('database', () => ({
  dialect: (process.env.DB_DIALECT || 'postgres') as Dialect,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taf_payroll',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  autoLoadModels: true,
  synchronizeModels: false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '5', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
  },
  retry: {
    max: parseInt(process.env.DB_RETRY_MAX || '3', 10),
  },
}));
