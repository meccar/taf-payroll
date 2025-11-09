import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { UserClaim } from '../../domain/entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserClaimRepository extends BaseRepository<UserClaim> {
  constructor() {
    super(UserClaim);
  }

  async findByUserId(
    userId: string,
    options?: FindOptions,
  ): Promise<UserClaim[]> {
    return this.findAll({
      where: { userId },
      ...options,
    });
  }

  async addClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<UserClaim> {
    return await this.create(
      {
        userId,
        claimType,
        claimValue,
      },
      transaction,
    );
  }

  async removeClaims(
    where: WhereOptions<UserClaim>,
    transaction?: Transaction,
  ): Promise<number> {
    return await UserClaim.destroy({
      where,
      transaction,
    });
  }
}
