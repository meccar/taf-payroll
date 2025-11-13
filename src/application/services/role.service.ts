import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction } from 'sequelize';
import { Role, RoleClaim } from '../../domain/entities';
import { BaseService } from './base.service';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    private readonly roleRepository: RoleRepository,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super(roleRepository, eventEmitter);
  }

  protected getEntityName(): string {
    return Role.name;
  }

  async findByName(name: string, options?: FindOptions): Promise<Role | null> {
    return this.roleRepository.findByName(name, options);
  }

  async addClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<RoleClaim> {
    return this.roleRepository.addClaim(
      roleId,
      claimType,
      claimValue,
      transaction,
    );
  }

  async removeClaim(
    roleId: string,
    claimType: string,
    claimValue: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    return this.roleRepository.removeClaim(
      roleId,
      claimType,
      claimValue,
      transaction,
    );
  }

  async getClaims(roleId: string, options?: FindOptions): Promise<RoleClaim[]> {
    return this.roleRepository.getClaims(roleId, options);
  }
}
