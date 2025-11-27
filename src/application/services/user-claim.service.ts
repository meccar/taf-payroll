import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction, WhereOptions } from 'sequelize';
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
      undefined,
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
    const claim = await UserClaim.findOne({
      where: { userId, claimType, claimValue },
      transaction,
    });
    if (!claim) return false;
    await claim.update(
      { claimType: newClaimType, claimValue: newClaimValue },
      { transaction },
    );
    return true;
  }

  async removeClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    const deleted = await UserClaim.destroy({
      where: { userId, claimType, claimValue },
      transaction,
    });
    return deleted > 0;
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
