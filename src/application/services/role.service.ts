import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
}
