import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from 'sequelize';
import { CreateResult, UpdateResult } from '../../domain/types';
import { Role } from '../../domain/entities';
import { BaseService } from './base.service';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super(Role, eventEmitter);
  }

  protected getEntityName(): string {
    return Role.name;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findOne({
      where: { normalizedName: name.toUpperCase() },
    });
  }

  async createRole(
    role: Partial<Role>,
    transaction?: Transaction,
  ): Promise<CreateResult<Role>> {
    role.normalizedName = role.name?.toUpperCase();
    const result = await this.create(role, undefined, transaction);
    if (!result) throw new BadRequestException('Failed to create role');
    return result;
  }

  async updateRole(
    id: string,
    role: Partial<Role>,
    transaction?: Transaction,
  ): Promise<UpdateResult<Role>> {
    if (role.name) role.normalizedName = role.name.toUpperCase();
    const result = await this.update(id, role, undefined, transaction);
    if (!result) throw new BadRequestException('Failed to update role');
    return result;
  }

  async deleteRole(id: string, transaction?: Transaction): Promise<boolean> {
    const result = await this.delete(id, undefined, transaction);
    return result.success;
  }
}
