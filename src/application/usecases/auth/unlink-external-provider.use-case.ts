import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserLoginService, UserService } from 'src/application/services';
import { AcceptedOAuthProvider } from 'src/shared/constants';

@Injectable()
export class UnlinkExternalProviderUseCase {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly userLoginService: UserLoginService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    provider: AcceptedOAuthProvider,
  ): Promise<void> {
    await this.sequelize.transaction(async (transaction: Transaction) => {
      // 1. Get user
      const user = await this.userService.findById(userId, { transaction });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 2. Get all user's external logins
      const logins = await this.userLoginService.findByUserId(userId, {
        transaction,
      });

      // 3. Safety check: Don't allow unlinking if it's the only login method
      const hasPassword = !!user.passwordHash;
      const loginCount = logins.length;

      if (!hasPassword && loginCount <= 1) {
        throw new BadRequestException(
          'Cannot remove last login method. Please set a password first.',
        );
      }

      // 4. Check if provider exists
      const hasProvider = logins.some(
        (login) => login.loginProvider === provider,
      );
      if (!hasProvider) {
        throw new NotFoundException(
          `${provider} account not found or already unlinked`,
        );
      }

      const providerKey = logins.find(
        (login) => login.loginProvider === provider,
      )?.providerKey;
      if (!providerKey) {
        throw new NotFoundException(
          `${provider} account not found or already unlinked`,
        );
      }

      // 5. Remove the provider
      await this.userLoginService.removeLogin(
        userId,
        provider,
        providerKey,
        transaction,
      );

      // Emit event
      this.eventEmitter.emit('oauth.unlinked', {
        userId,
        provider,
      });
    });
  }
}
