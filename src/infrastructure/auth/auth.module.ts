import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import authConfig from './auth.config';
import { PasetoAuthService } from './paseto-auth.service';
import { OAuthStrategy } from './oauth.strategy';
import { AUTH_SERVICE_TOKEN } from '../../application/auth';

@Module({
  imports: [ConfigModule.forFeature(authConfig), PassportModule],
  providers: [
    {
      provide: AUTH_SERVICE_TOKEN,
      useClass: PasetoAuthService,
    },
    ...(process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET
      ? [OAuthStrategy]
      : []),
  ],
  exports: [AUTH_SERVICE_TOKEN, PassportModule],
})
export class AuthModule {}
