import { BadRequestException, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import { DeleteResult } from 'src/domain/types';
import { UserClaim } from '../models';

@Injectable()
export class UserClaimRepository extends BaseRepository<UserClaim> {
  constructor() {
    super(UserClaim);
  }

  protected getEntityName(): string {
    return UserClaim.name;
  }

  async getClaims(userId: string): Promise<UserClaim[]> {
    return this.findAll({
      where: { userId },
    });
  }

  async addClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<UserClaim> {
    const result = await this.create(
      {
        userId,
        claimType,
        claimValue,
      },
      transaction,
    );
    if (!result) throw new BadRequestException('Failed to add claim to user');
    return result.entity;
  }

  async replaceClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    newClaimType: string,
    newClaimValue: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    const claim = await this.findOne({
      where: { userId, claimType, claimValue },
      transaction,
    });
    if (!claim) return false;
    await this.update(
      claim.id,
      { claimType: newClaimType, claimValue: newClaimValue },
      transaction,
    );
    return true;
  }

  async removeClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<DeleteResult> {
    return await this.delete(
      { where: { userId, claimType, claimValue } },
      transaction,
    );
  }
}
