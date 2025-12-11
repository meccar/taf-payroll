import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Role } from '../models';
import { RoleAdapter } from 'src/domain/adapters';
import { Role as RoleEntity } from 'src/domain/entities';

@Injectable()
export class RoleRepository
  extends BaseRepository<Role, RoleEntity>
  implements RoleAdapter
{
  constructor() {
    super(Role, RoleEntity);
  }

  protected getEntityName(): string {
    return Role.name;
  }

  async getAll(): Promise<RoleEntity[]> {
    return this.findAll();
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.findOne({
      where: { normalizedName: name.toUpperCase() },
    });
  }
}
