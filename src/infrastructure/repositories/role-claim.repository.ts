import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { RoleClaim } from '../../domain/entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class RoleClaimRepository extends BaseRepository<RoleClaim> {
  constructor() {
    super(RoleClaim);
  }

  async findByRoleId(
    roleId: string,
    options?: FindOptions,
  ): Promise<RoleClaim[]> {
    return this.findAll({
      where: { roleId },
      ...options,
    });
  }

  async addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<RoleClaim> {
    return await this.create(
      {
        roleId,
        claimType,
        claimValue,
      },
      transaction,
    );
  }

  async removeClaims(
    where: WhereOptions<RoleClaim>,
    transaction?: Transaction,
  ): Promise<number> {
    return await RoleClaim.destroy({
      where,
      transaction,
    });
  }
}
