import {
  Injectable,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OAuthService } from 'src/application/services';
import type { OAuthProfile } from 'src/shared/types';
import { UserLoginAdapter } from 'src/domain/adapters';
import { UNIT_OF_WORK } from 'src/shared/constants';
import type { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class LinkExternalProviderUseCase {
  constructor(
    private readonly userLoginAdapter: UserLoginAdapter,
    private readonly oauthService: OAuthService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(userId: string, profile: OAuthProfile): Promise<void> {
    return this.unitOfWork.execute<void>(async () => {
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
      );

      // Emit event
      this.eventEmitter.emit('oauth.linked', {
        userId,
        provider: profile.provider,
      });
    });
  }
}
