import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import authConfig from './auth.config';
import { PasetoAuthService } from './paseto-auth.service';
import { AUTH_SERVICE_TOKEN } from '../../application/auth';

@Module({
  imports: [ConfigModule.forFeature(authConfig)],
  providers: [
    {
      provide: AUTH_SERVICE_TOKEN,
      useClass: PasetoAuthService,
    },
  ],
  exports: [AUTH_SERVICE_TOKEN],
})
export class AuthModule {}
