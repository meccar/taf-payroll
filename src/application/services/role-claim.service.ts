import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from 'sequelize';
import { RoleClaim } from '../../domain/entities';
import { BaseService } from './base.service';

@Injectable()
export class RoleClaimService extends BaseService<RoleClaim> {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super(RoleClaim, eventEmitter);
  }

  protected getEntityName(): string {
    return RoleClaim.name;
  }

  async getClaims(roleId: string): Promise<RoleClaim[]> {
    return this.findAll({
      where: { roleId },
    });
  }

  async addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<RoleClaim> {
    const result = await this.create(
      {
        roleId,
        claimType,
        claimValue,
      },
      undefined,
      transaction,
    );
    if (!result) throw new BadRequestException('Failed to add claim to role');
    return result.entity;
  }

  async removeClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    const deleted = await RoleClaim.destroy({
      where: { roleId, claimType, claimValue },
      transaction,
    });
    return deleted > 0;
  }
}
