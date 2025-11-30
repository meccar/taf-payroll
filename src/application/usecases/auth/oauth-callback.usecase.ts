// use-cases/oauth-callback.use-case.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transactional } from 'src/infrastructure/database';
import {
  OAuthService,
  UserLoginService,
  UserService,
} from 'src/application/services';
import type { AcceptedOAuthProvider } from 'src/shared/constants';
import { generatePasetoToken } from 'src/shared/utils';
import { User } from 'src/domain/entities';
import { ConfigService } from '@nestjs/config';

export interface OAuthCallbackResult {
  redirectUrl: string;
}

@Injectable()
export class OAuthCallbackUseCase {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly userLoginService: UserLoginService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    provider: AcceptedOAuthProvider,
    rawProfile: any,
  ): Promise<OAuthCallbackResult> {
    try {
      // 1. Validate provider is accepted
      this.oauthService.validateProvider(provider);

      // 2. Normalize profile from different providers to standard format
      const profile = this.oauthService.normalizeProfile(provider, rawProfile);

      // 3. Validate profile has required fields
      this.oauthService.validateProfile(profile);

      // 4. Use transaction for data consistency
      const result = await this.sequelize.transaction(
        async (
          transaction: Transaction,
        ): Promise<{ user: User; isNewUser: boolean }> => {
          // Check if OAuth login exists
          const existingLogin = await this.userLoginService.findByLogin(
            profile.provider,
            profile.providerId,
            { transaction },
          );

          let user: User | null = null;
          let isNewUser = false;

          if (existingLogin) {
            // User already has this OAuth account linked
            user = await this.userService.findById(existingLogin.userId, {
              transaction,
            });
          } else {
            // Check if user exists by email
            const existingUser = await this.userService.findByEmail(
              profile.email ?? '',
            );

            if (existingUser) {
              // Link OAuth to existing user
              await this.userLoginService.addLogin(
                existingUser.id,
                profile.provider,
                profile.providerId,
                profile.displayName || profile.provider,
                transaction,
              );
              user = existingUser;

              // Emit event
              this.eventEmitter.emit('oauth.linked', {
                userId: user.id,
                provider: profile.provider,
              });
            } else {
              // Create new user
              const userDto: Partial<User> = {
                email: profile.email,
                userName: profile.email?.split('@')[0],
                normalizedEmail: profile.email?.toUpperCase(),
                normalizedUserName: profile.email?.split('@')[0].toUpperCase(),
                emailConfirmed: profile.emailVerified,
              };
              user = (
                await this.userService.createOAuthUser(userDto, transaction)
              ).entity;
              isNewUser = true;

              // Link OAuth account
              await this.userLoginService.addLogin(
                user.id,
                profile.provider,
                profile.providerId,
                profile.displayName || profile.provider,
                transaction,
              );

              // Emit event
              this.eventEmitter.emit('user.created.oauth', {
                userId: user.id,
                provider: profile.provider,
              });
            }
          }

          if (!user) throw new BadRequestException('User not found');

          return { user, isNewUser };
        },
      );

      const payload = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.roles,
      };

      // 5. Generate token
      const token = await generatePasetoToken(this.configService, payload);

      // 6. Emit login event
      this.eventEmitter.emit('user.login.oauth', {
        userId: result.user.id,
        provider,
        isNewUser: result.isNewUser,
      });

      // 7. Generate redirect URL
      const redirectUrl = this.oauthService.getCallbackRedirectUrl(
        token,
        result.isNewUser,
      );

      return { redirectUrl };
    } catch (error) {
      // Generate error redirect URL
      const redirectUrl = this.oauthService.getCallbackErrorRedirectUrl(
        error as Error | string,
      );
      return { redirectUrl };
    }
  }
}
