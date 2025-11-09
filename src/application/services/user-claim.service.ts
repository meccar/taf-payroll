import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { UserClaim } from '../../domain/entities';
import { BaseService } from './base.service';
import { UserClaimRepository } from '../../infrastructure/repositories/user-claim.repository';

@Injectable()
export class UserClaimService extends BaseService<UserClaim> {
  constructor(private readonly userClaimRepository: UserClaimRepository) {
    super(userClaimRepository);
  }

  async getUserClaims(
    userId: string,
    options?: FindOptions,
  ): Promise<UserClaim[]> {
    return this.userClaimRepository.findByUserId(userId, options);
  }

  async addClaimToUser(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<UserClaim> {
    return this.userClaimRepository.addClaim(
      userId,
      claimType,
      claimValue,
      transaction,
    );
  }

  async removeClaimById(
    claimId: number,
    transaction?: Transaction,
  ): Promise<boolean> {
    return this.delete(String(claimId), transaction);
  }

  async removeClaims(
    where: WhereOptions<UserClaim>,
    transaction?: Transaction,
  ): Promise<number> {
    return this.userClaimRepository.removeClaims(where, transaction);
  }
}
