import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserAdapter, UserLoginAdapter } from 'src/domain/adapters';
import type { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';
import { UNIT_OF_WORK } from 'src/shared/constants';
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
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(userId: string): Promise<ConnectedAccountsResult> {
    return this.unitOfWork.execute<ConnectedAccountsResult>(async () => {
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
    });
  }
}
