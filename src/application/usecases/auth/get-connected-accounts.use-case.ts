import { Injectable, NotFoundException } from '@nestjs/common';
import { UserLoginService, UserService } from 'src/application/services';

export interface ConnectedAccount {
  provider: string;
  displayName: string;
  canRemove: boolean;
}

export interface ConnectedAccountsResult {
  hasPassword: boolean;
  accounts: ConnectedAccount[];
}

@Injectable()
export class GetConnectedAccountsUseCase {
  constructor(
    private readonly userLoginService: UserLoginService,
    private readonly userService: UserService,
  ) {}

  async execute(userId: string): Promise<ConnectedAccountsResult> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const logins = await this.userLoginService.findByUserId(userId);
    const hasPassword = !!user.passwordHash;

    const accounts = logins.map((login) => ({
      provider: login.loginProvider,
      displayName: login.providerDisplayName || login.loginProvider,
      // Can remove if: has password OR has multiple logins
      canRemove: hasPassword || logins.length > 1,
    }));

    return {
      hasPassword,
      accounts,
    };
  }
}
