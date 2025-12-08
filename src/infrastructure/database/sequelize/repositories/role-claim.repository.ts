import { BadRequestException, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { PermissionDto } from 'src/shared/dtos';
import { DeleteResult } from 'src/domain/types';
import { BaseRepository } from './base.repository';
import { RoleClaim } from '../models';

@Injectable()
export class RoleClaimRepository extends BaseRepository<RoleClaim> {
  constructor() {
    super(RoleClaim);
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
  ): Promise<DeleteResult> {
    return await this.delete({
      where: { roleId, claimType, claimValue },
      transaction,
    });
  }

  async addPermission(
    roleId: string,
    permission: PermissionDto[],
    transaction?: Transaction,
  ): Promise<RoleClaim[]> {
    const claims: Partial<RoleClaim>[] = [];

    permission.forEach((p) => {
      if (p.permissions) {
        p.permissions.forEach((perm) => {
          claims.push({
            roleId,
            claimType: 'Permission',
            claimValue: perm,
          });
        });
      }
    });

    const result = await this.bulkCreate(claims, transaction, {
      ignoreDuplicates: true,
    });
    return result.entities;
  }
}
