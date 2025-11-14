import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
  baseUrl: string;
}

export default registerAs<EmailConfig>('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'TAF Payroll',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '',
  },
  baseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
}));
