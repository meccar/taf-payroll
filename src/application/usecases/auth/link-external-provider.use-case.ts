import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OAuthService } from 'src/application/services';
import { Transactional } from 'src/infrastructure/database/sequelize';
import type { OAuthProfile } from 'src/shared/types';
import { UserLoginAdapter } from 'src/domain/adapters';

@Injectable()
export class LinkExternalProviderUseCase {
  constructor(
    @InjectConnection()
    private readonly userLoginAdapter: UserLoginAdapter,
    private readonly oauthService: OAuthService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(
    userId: string,
    profile: OAuthProfile,
    transaction?: Transaction,
  ): Promise<void> {
    this.oauthService.validateProvider(profile.provider);

    this.oauthService.validateProfile(profile);

    const existingLogin = await this.userLoginAdapter.findByLogin(
      profile.provider,
      profile.providerId,
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
    const userLogins = await this.userLoginAdapter.findByUserId(userId);
    const hasProvider = userLogins?.some(
      (login) => login.loginProvider === profile.provider,
    );

    if (hasProvider)
      throw new BadRequestException(
        `You already have a ${profile.provider} account linked. Please unlink it first.`,
      );

    // 3. Link the provider
    await this.userLoginAdapter.addLogin(
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
  }
}
