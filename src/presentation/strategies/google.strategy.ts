import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OAUTH_PROVIDERS } from 'src/shared/constants';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  OAUTH_PROVIDERS.GOOGLE,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('OAUTH_GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('OAUTH_GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('OAUTH_GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  validate(accessToken: string, refreshToken: string, profile: any): any {
    return { ...profile, accessToken, refreshToken };
  }
}
