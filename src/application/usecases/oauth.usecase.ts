import { Injectable } from '@nestjs/common';
import { OAuthService, type OAuthUser } from '../services/oauth.service';
import { Transactional } from '../../infrastructure/database';
import { Transaction } from 'sequelize';

@Injectable()
export class OAuthUseCase {
  constructor(private readonly oauthService: OAuthService) {}

  @Transactional()
  async execute(
    oauthUser: OAuthUser,
    transaction?: Transaction,
  ): Promise<string> {
    return await this.oauthService.authenticate(oauthUser, transaction);
  }
}
