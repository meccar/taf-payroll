import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { RoleClaim } from '../../domain/entities';
import { BaseService } from './base.service';
import { RoleClaimRepository } from '../../infrastructure/repositories/role-claim.repository';

@Injectable()
export class RoleClaimService extends BaseService<RoleClaim> {
  constructor(
    protected readonly roleClaimRepository: RoleClaimRepository,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super(roleClaimRepository, eventEmitter);
  }

  protected getEntityName(): string {
    return RoleClaim.name;
  }

  async getRoleClaims(
    roleId: string,
    options?: FindOptions,
  ): Promise<RoleClaim[]> {
    return this.roleClaimRepository.findByRoleId(roleId, options);
  }

  async addClaimToRole(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<RoleClaim> {
    return this.roleClaimRepository.addClaim(
      roleId,
      claimType,
      claimValue,
      transaction,
    );
  }

  async removeClaims(
    where: WhereOptions<RoleClaim>,
    transaction?: Transaction,
  ): Promise<number> {
    return this.roleClaimRepository.removeClaims(where, transaction);
  }
}
