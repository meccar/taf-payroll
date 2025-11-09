const path = require('path');
const dotenv = require('dotenv');

const envFiles = ['.env.local', '.env'].map((file) =>
  path.resolve(process.cwd(), file),
);

for (const file of envFiles) {
  dotenv.config({ path: file });
}

const baseConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taf_payroll',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true,
  },
};

module.exports = {
  development: {
    ...baseConfig,
  },
  staging: {
    ...baseConfig,
    logging: false,
  },
  production: {
    ...baseConfig,
    logging: false,
  },
};
