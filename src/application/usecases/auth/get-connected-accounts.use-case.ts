import { Injectable, NotFoundException } from '@nestjs/common';
import { UserAdapter, UserLoginAdapter } from 'src/domain/adapters';
import { MESSAGES } from 'src/shared/messages';

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
    private readonly userAdapter: UserAdapter,
    private readonly userLoginAdapter: UserLoginAdapter,
  ) {}

  async execute(userId: string): Promise<ConnectedAccountsResult> {
    const user = await this.userAdapter.findById(userId);
    if (!user) throw new NotFoundException(MESSAGES.ERR_USER_NOT_FOUND);

    const logins = await this.userLoginAdapter.findByUserId(userId);
    const hasPassword = !!user.passwordHash;

    const accounts = logins.map((login) => ({
      provider: login.loginProvider,
      displayName: login.providerDisplayName || login.loginProvider,
      canRemove: hasPassword || logins.length > 1,
    }));

    return {
      hasPassword,
      accounts,
    };
  }
}
