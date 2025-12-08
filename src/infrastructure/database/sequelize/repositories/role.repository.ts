import { BadRequestException, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import { CreateResult, UpdateResult } from 'src/domain/types';
import { Role } from '../models';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  protected getEntityName(): string {
    return Role.name;
  }

  async getAll(): Promise<Role[]> {
    return this.findAll();
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
    const result = await this.create(role, transaction);
    if (!result) throw new BadRequestException('Failed to create role');
    return result;
  }

  async updateRole(
    id: string,
    role: Partial<Role>,
    transaction?: Transaction,
  ): Promise<UpdateResult<Role>> {
    if (role.name) role.normalizedName = role.name.toUpperCase();
    const result = await this.update(id, role, transaction);
    if (!result) throw new BadRequestException('Failed to update role');
    return result;
  }

  async deleteRole(id: string, transaction?: Transaction): Promise<boolean> {
    const result = await this.delete({ where: { id } }, transaction);
    return result.success;
  }
}
