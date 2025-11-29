import { BadRequestException, Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import * as services from 'src/application/services';
import { Transactional } from 'src/infrastructure/database';
import type { AcceptedOAuthProvider } from 'src/shared/constants';

@Injectable()
export class OAuthCallbackUseCase {
  constructor(private readonly oauthService: services.OAuthService) {}

  @Transactional()
  async execute(
    oauthUser: services.OAuthUser,
    transaction?: Transaction,
  ): Promise<string> {
    return await this.oauthService.authenticate(oauthUser, transaction);
  }

  @Transactional()
  async executeCallback(
    oauthUser?: services.OAuthUser,
    provider?: AcceptedOAuthProvider,
    transaction?: Transaction,
  ): Promise<string> {
    if (!oauthUser || !provider)
      throw new BadRequestException('OAuth authentication failed');

    const token = await this.oauthService.processCallback(
      oauthUser,
      provider,
      transaction,
    );

    return this.oauthService.getCallbackRedirectUrl(token);
  }
}
