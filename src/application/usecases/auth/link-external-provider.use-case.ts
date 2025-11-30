import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OAuthProfile,
  OAuthService,
  UserLoginService,
} from 'src/application/services';

@Injectable()
export class LinkExternalProviderUseCase {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly userLoginService: UserLoginService,
    private readonly oauthService: OAuthService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, profile: OAuthProfile): Promise<void> {
    // Validate provider
    this.oauthService.validateProvider(profile.provider);

    // Validate profile
    this.oauthService.validateProfile(profile);

    await this.sequelize.transaction(async (transaction: Transaction) => {
      // 1. Check if this OAuth account is already linked to ANY user
      const existingLogin = await this.userLoginService.findByLogin(
        profile.provider,
        profile.providerId,
        { transaction },
      );

      if (existingLogin) {
        if (existingLogin.userId === userId)
          throw new BadRequestException(
            `This ${profile.provider} account is already linked to your account`,
          );
        else
          throw new ConflictException(
            `This ${profile.provider} account is already linked to another user`,
          );
      }

      // 2. Check if user already has this provider linked (different account)
      const userLogins = await this.userLoginService.findByUserId(userId);
      const hasProvider = userLogins?.some(
        (login) => login.loginProvider === profile.provider,
      );

      if (hasProvider)
        throw new BadRequestException(
          `You already have a ${profile.provider} account linked. Please unlink it first.`,
        );

      // 3. Link the provider
      await this.userLoginService.addLogin(
        userId,
        profile.provider,
        profile.providerId,
        profile.displayName || profile.provider,
        transaction,
      );

      // Emit event
      this.eventEmitter.emit('oauth.linked', {
        userId,
        provider: profile.provider,
      });
    });
  }
}
