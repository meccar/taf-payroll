import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UNIT_OF_WORK, type AcceptedOAuthProvider } from 'src/shared/constants';
import { UserAdapter, UserLoginAdapter } from 'src/domain/adapters';
import { MESSAGES } from 'src/shared/messages';
import type { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class UnlinkExternalProviderUseCase {
  constructor(
    private readonly userLoginAdapter: UserLoginAdapter,
    private readonly userAdapter: UserAdapter,
    private readonly eventEmitter: EventEmitter2,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    userId: string,
    provider: AcceptedOAuthProvider,
  ): Promise<void> {
    return this.unitOfWork.execute<void>(async () => {
      // 1. Get user
      const user = await this.userAdapter.findById(userId);
      if (!user) throw new NotFoundException(MESSAGES.ERR_USER_NOT_FOUND);

      // 2. Get all user's external logins
      const logins = await this.userLoginAdapter.findByUserId(userId);
      if (!logins || logins.length === 0)
        throw new BadRequestException(MESSAGES.ERR_OCCURRED);

      // 3. Safety check: Don't allow unlinking if it's the only login method
      const hasPassword = !!user.passwordHash;
      const loginCount = logins.length;

      if (!hasPassword && loginCount <= 1)
        throw new BadRequestException(
          'Cannot remove last login method. Please set a password first.',
        );

      // 4. Check if provider exists
      const hasProvider = logins.some(
        (login) => login.loginProvider === provider,
      );
      if (!hasProvider)
        throw new NotFoundException(
          `${provider} account not found or already unlinked`,
        );

      const providerKey = logins.find(
        (login) => login.loginProvider === provider,
      )?.providerKey;
      if (!providerKey)
        throw new NotFoundException(
          `${provider} account not found or already unlinked`,
        );

      // 5. Remove the provider
      await this.userLoginAdapter.removeLogin(userId, provider, providerKey);

      // Emit event
      this.eventEmitter.emit('oauth.unlinked', {
        userId,
        provider,
      });
    });
  }
}
