import { BadRequestException, Injectable } from '@nestjs/common';
import { OAuthService, type OAuthUser } from '../services/oauth.service';
import type { AcceptedOAuthProvider } from '../../shared/constants/oauth.constants';
import { Transactional } from '../../infrastructure/database';
import type { Transaction } from 'sequelize';

@Injectable()
export class OAuthCallbackUseCase {
  constructor(private readonly oauthService: OAuthService) {}

  @Transactional()
  async execute(
    oauthUser: OAuthUser,
    transaction?: Transaction,
  ): Promise<string> {
    return await this.oauthService.authenticate(oauthUser, transaction);
  }

  @Transactional()
  async executeCallback(
    oauthUser?: OAuthUser,
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
