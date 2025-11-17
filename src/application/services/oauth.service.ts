import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User, UserLogin } from '../../domain/entities';
import { UserService } from './user.service';
import { UserLoginService } from './user-login.service';
import { PROVIDER } from '../../shared/constants/provider.constants';
import {
  ACCEPTED_OAUTH_PROVIDERS,
  AcceptedOAuthProvider,
} from '../../shared/constants/oauth.constants';
import { generatePasetoToken } from '../../shared/utils/paseto.util';
import { AUTH_MESSAGES } from '../../shared/messages/auth.messages';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface OAuthUser {
  provider: AcceptedOAuthProvider;
  providerId: string;
  email?: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photo?: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class OAuthService {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly userService: UserService,
    private readonly userLoginService: UserLoginService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async authenticate(
    oauthUser: OAuthUser,
    transaction?: Transaction,
  ): Promise<string> {
    const { provider, providerId, email, emailVerified, displayName } =
      oauthUser;

    if (!email) {
      throw new BadRequestException(
        `${provider} account does not have an email address`,
      );
    }

    // Validate provider is accepted
    if (!ACCEPTED_OAUTH_PROVIDERS.includes(provider)) {
      throw new BadRequestException(
        `OAuth provider "${provider}" is not accepted. Accepted providers: ${ACCEPTED_OAUTH_PROVIDERS.join(', ')}`,
      );
    }

    // Check if user already has this OAuth login
    const existingLogin = await this.userLoginService.findByLogin(
      provider,
      providerId,
      { transaction },
    );

    let user: User;

    if (existingLogin) {
      // User already linked OAuth account
      const foundUser = await this.userService.findById(existingLogin.userId, {
        transaction,
      });
      if (!foundUser) {
        throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);
      }
      user = foundUser;
    } else {
      // Check if user exists with this email
      const normalizedEmail = email.toUpperCase();
      let existingUser = await this.userService.findByEmail(normalizedEmail);

      if (existingUser) {
        // Link OAuth account to existing user
        await this.userLoginService.addLogin(
          existingUser.id,
          provider,
          providerId,
          displayName || provider,
          transaction,
        );
        user = existingUser;
      } else {
        // Create new user with OAuth account
        const userName = email.split('@')[0];
        const normalizedUserName = userName.toUpperCase();

        user = await this.userService.createUser(
          {
            email,
            normalizedEmail,
            userName,
            normalizedUserName,
            emailConfirmed: emailVerified,
            // OAuth users don't need a password
            passwordHash: undefined,
          },
          transaction,
        );

        // Add OAuth login
        await this.userLoginService.addLogin(
          user.id,
          provider,
          providerId,
          displayName || provider,
          transaction,
        );
      }
    }

    // Generate token
    const payload = await this.userService.buildPasetoPayload(user);
    return generatePasetoToken(this.configService, payload);
  }
}
