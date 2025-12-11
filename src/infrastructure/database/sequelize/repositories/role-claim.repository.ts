import { BadRequestException, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { PermissionDto } from 'src/shared/dtos';
import { DeleteResult } from 'src/domain/types';
import { BaseRepository } from './base.repository';
import { RoleClaim } from '../models';
import { RoleClaimAdapter } from 'src/domain/adapters';
import { RoleClaim as RoleClaimEntity } from 'src/domain/entities';

@Injectable()
export class RoleClaimRepository
  extends BaseRepository<RoleClaim, RoleClaimEntity>
  implements RoleClaimAdapter
{
  constructor() {
    super(RoleClaim, RoleClaimEntity);
  }

  protected getEntityName(): string {
    return RoleClaim.name;
  }

  async getClaims(roleId: string): Promise<RoleClaimEntity[]> {
    return this.findAll({
      where: { roleId },
    });
  }

  async addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<RoleClaimEntity> {
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
  ): Promise<RoleClaimEntity[]> {
    const claims: Partial<RoleClaimEntity>[] = [];

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
