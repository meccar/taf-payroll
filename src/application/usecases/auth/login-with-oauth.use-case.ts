// use-cases/login-with-oauth.use-case.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ulid } from 'ulid';
import { randomBytes } from 'crypto';
import {
  OAuthProfile,
  OAuthService,
  UserLoginService,
  UserService,
} from 'src/application/services';
import { MESSAGES } from 'src/shared/messages';
import { User } from 'src/domain/entities';
import { generatePasetoToken } from 'src/shared/utils';

export interface LoginWithOAuthResult {
  token: string;
  user: User;
  isNewUser: boolean;
}

@Injectable()
export class LoginWithOAuthUseCase {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly userService: UserService,
    private readonly userLoginService: UserLoginService,
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(profile: OAuthProfile): Promise<LoginWithOAuthResult> {
    // Validate provider
    this.oauthService.validateProvider(profile.provider);

    // Validate profile has required fields
    this.oauthService.validateProfile(profile);

    // Use transaction for data consistency
    return await this.sequelize.transaction(
      async (transaction: Transaction) => {
        // 1. Check if this OAuth login already exists
        const existingLogin = await this.userLoginService.findByLogin(
          profile.provider,
          profile.providerId,
          { transaction },
        );

        let user: User;
        let isNewUser = false;

        if (existingLogin) {
          // User already has this OAuth login linked
          const foundUser = await this.userService.findById(
            existingLogin.userId,
            {
              transaction,
            },
          );

          if (!foundUser) {
            throw new UnauthorizedException(MESSAGES.ERR_UNAUTHORIZED);
          }

          user = foundUser;
        } else {
          // Check if user exists with this email
          const normalizedEmail = profile.email!.toUpperCase();
          const existingUser = await this.userService.findByEmail(
            profile.email!,
          );

          if (existingUser) {
            // Link OAuth account to existing user
            await this.userLoginService.addLogin(
              existingUser.id,
              profile.provider,
              profile.providerId,
              profile.displayName || profile.provider,
              transaction,
            );

            user = existingUser;

            // Emit event: OAuth linked to existing account
            this.eventEmitter.emit('oauth.linked', {
              userId: user.id,
              provider: profile.provider,
            });
          } else {
            // Create new user with OAuth account
            const userName = profile.email!.split('@')[0];
            const normalizedUserName = userName.toUpperCase();

            const createResult = await this.userService.createUser(
              {
                email: profile.email,
                normalizedEmail,
                userName,
                normalizedUserName,
                emailConfirmed: profile.emailVerified,
                securityStamp: randomBytes(32).toString('base64'),
                concurrencyStamp: ulid(),
                lockoutEnabled: true,
                twoFactorEnabled: false,
                accessFailedCount: 0,
                // OAuth users don't need a password initially
                passwordHash: undefined,
              },
              transaction,
            );

            if (!createResult) {
              throw new BadRequestException(MESSAGES.ERR_FAILED_TO_CREATE_USER);
            }

            user = createResult.entity;
            isNewUser = true;

            // Add OAuth login
            await this.userLoginService.addLogin(
              user.id,
              profile.provider,
              profile.providerId,
              profile.displayName || profile.provider,
              transaction,
            );

            // Emit event: New user created via OAuth
            this.eventEmitter.emit('user.created.oauth', {
              userId: user.id,
              provider: profile.provider,
              email: profile.email,
            });
          }
        }

        // Generate token
        const payload = await this.userService.buildPasetoPayload(user);
        const token = await generatePasetoToken(this.configService, payload);

        // Emit event: User logged in via OAuth
        this.eventEmitter.emit('user.login.oauth', {
          userId: user.id,
          provider: profile.provider,
          isNewUser,
        });

        return {
          token,
          user,
          isNewUser,
        };
      },
    );
  }
}
