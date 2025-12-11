// use-cases/oauth-callback.use-case.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { OAuthService } from 'src/application/services';
import type { AcceptedOAuthProvider } from 'src/shared/constants';
import {
  generateConcurrencyStamp,
  generatePasetoToken,
  generateSecurityStamp,
} from 'src/shared/utils';
import { User } from 'src/domain/entities';
import { ConfigService } from '@nestjs/config';
import { MESSAGES } from 'src/shared/messages';
import { OAuthCallbackDto } from 'src/shared/dtos';
import { UserAdapter, UserLoginAdapter } from 'src/domain/adapters';

@Injectable()
export class OAuthCallbackUseCase {
  constructor(
    @InjectConnection()
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
    private readonly userAdapter: UserAdapter,
    private readonly userLoginAdapter: UserLoginAdapter,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    provider: AcceptedOAuthProvider,
    rawProfile: any,
    transaction?: Transaction,
  ): Promise<OAuthCallbackDto> {
    try {
      this.oauthService.validateProvider(provider);

      const profile = this.oauthService.normalizeProfile(provider, rawProfile);

      this.oauthService.validateProfile(profile);

      const existingLogin = await this.userLoginAdapter.findByLogin(
        profile.provider,
        profile.providerId,
        { transaction },
      );

      let user: User | null = null;
      let isNewUser = false;

      if (existingLogin) {
        user = await this.userAdapter.findById(existingLogin.userId, {
          transaction,
        });
      } else {
        const existingUser = await this.userAdapter.findByEmail(
          profile.email ?? '',
        );

        if (existingUser) {
          await this.userLoginAdapter.addLogin(
            existingUser.id,
            profile.provider,
            profile.providerId,
            profile.displayName || profile.provider,
            transaction,
          );
          user = existingUser;

          this.eventEmitter.emit('oauth.linked', {
            userId: user.id,
            provider: profile.provider,
          });
        } else {
          const userDto: Partial<User> = {
            email: profile.email,
            normalizedEmail: profile.email?.toUpperCase(),
            emailConfirmed: profile.emailVerified,
          };

          userDto.securityStamp = generateSecurityStamp();
          userDto.concurrencyStamp = generateConcurrencyStamp();

          const result = await this.userAdapter.create(userDto, transaction);
          if (!result)
            throw new BadRequestException(MESSAGES.ERR_FAILED_TO_CREATE_USER);

          user = result.entity;
          isNewUser = true;

          await this.userLoginAdapter.addLogin(
            user.id,
            profile.provider,
            profile.providerId,
            profile.displayName || profile.provider,
            transaction,
          );

          this.eventEmitter.emit('user.created.oauth', {
            userId: user.id,
            provider: profile.provider,
          });
        }
      }

      if (!user) throw new BadRequestException(MESSAGES.ERR_USER_NOT_FOUND);

      const payload = {
        userId: user.id,
        email: user.email,
        role: user.roles,
      };

      const token = await generatePasetoToken(this.configService, payload);

      this.eventEmitter.emit('user.login.oauth', {
        userId: user.id,
        provider,
        isNewUser,
      });

      return this.oauthService.getCallbackRedirectUrl(token, isNewUser);
    } catch (error) {
      return this.oauthService.getCallbackErrorRedirectUrl(
        error as Error | string,
      );
    }
  }
}
