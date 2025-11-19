import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { UserClaim } from '../../domain/entities';
import { BaseService } from './base.service';

@Injectable()
export class UserClaimService extends BaseService<UserClaim> {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super(UserClaim, eventEmitter);
  }

  protected getEntityName(): string {
    return UserClaim.name;
  }

  async getUserClaims(
    userId: string,
    options?: FindOptions,
  ): Promise<UserClaim[]> {
    return UserClaim.findAll({
      where: { userId },
      ...options,
    });
  }

  async addClaimToUser(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<UserClaim> {
    return UserClaim.create(
      {
        userId,
        claimType,
        claimValue,
      },
      { transaction },
    );
  }

  async removeClaimById(
    claimId: number,
    transaction?: Transaction,
  ): Promise<boolean> {
    const result = await this.delete(String(claimId), undefined, transaction);
    return result.success;
  }

  async removeClaims(
    where: WhereOptions<UserClaim>,
    transaction?: Transaction,
  ): Promise<number> {
    return UserClaim.destroy({
      where,
      transaction,
    });
  }
}
