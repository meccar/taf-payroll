import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { Role, RoleClaim } from '../../domain/entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async findByName(name: string, options?: FindOptions): Promise<Role | null> {
    return this.findOne({
      where: { normalizedName: name.toUpperCase() },
      ...options,
    });
  }

  async addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<RoleClaim> {
    return await RoleClaim.create(
      {
        roleId,
        claimType,
        claimValue,
      },
      { transaction },
    );
  }

  async removeClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    const deleted = await RoleClaim.destroy({
      where: {
        roleId,
        claimType,
        claimValue,
      },
      transaction,
    });
    return deleted > 0;
  }

  async getClaims(roleId: string, options?: FindOptions): Promise<RoleClaim[]> {
    return await RoleClaim.findAll({
      where: { roleId },
      ...options,
    });
  }
}
