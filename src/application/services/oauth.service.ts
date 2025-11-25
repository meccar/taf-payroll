import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../domain/entities';
import { UserService } from './user.service';
import { UserLoginService } from './user-login.service';
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

  validateProvider(provider: AcceptedOAuthProvider): void {
    if (!ACCEPTED_OAUTH_PROVIDERS.includes(provider)) {
      throw new BadRequestException(
        `OAuth provider "${provider}" is not accepted. Accepted providers: ${ACCEPTED_OAUTH_PROVIDERS.join(', ')}`,
      );
    }
  }

  getCallbackRedirectUrl(token: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    return `${frontendUrl}/auth/callback?token=${token}`;
  }

  getCallbackErrorRedirectUrl(error: Error | string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    const errorMessage =
      error instanceof Error ? error.message : 'Authentication failed';
    return `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`;
  }

  async processCallback(
    oauthUser: OAuthUser | null,
    provider: AcceptedOAuthProvider,
    transaction?: Transaction,
  ): Promise<string> {
    this.validateProvider(provider);

    if (!oauthUser) {
      throw new BadRequestException('OAuth authentication failed');
    }

    return await this.authenticate(oauthUser, transaction);
  }

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
    this.validateProvider(provider);

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
        throw new UnauthorizedException(AUTH_MESSAGES.ERR_UNAUTHORIZED);
      }
      user = foundUser;
    } else {
      // Check if user exists with this email
      const normalizedEmail = email.toUpperCase();
      const existingUser = await this.userService.findByEmail(normalizedEmail);

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

        const createResult = await this.userService.createUser(
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
        if (!createResult)
          throw new BadRequestException(
            AUTH_MESSAGES.ERR_FAILED_TO_CREATE_USER,
          );

        user = createResult.entity;

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
