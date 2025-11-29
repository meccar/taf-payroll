import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from 'sequelize';
import { RoleClaim } from '../../domain/entities';
import { BaseService } from './base.service';
import { PermissionDto } from 'src/shared/dtos';
import { DeleteResult } from 'src/domain/types';

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

    const result = await this.bulkCreate(claims, undefined, transaction, {
      ignoreDuplicates: true,
    });
    return result.entities;
  }
}
