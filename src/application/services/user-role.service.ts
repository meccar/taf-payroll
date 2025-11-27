import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from 'sequelize';
import { UserRole } from '../../domain/entities';
import { BaseService } from './base.service';

@Injectable()
export class UserRoleService extends BaseService<UserRole> {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super(UserRole, eventEmitter);
  }

  protected getEntityName(): string {
    return UserRole.name;
  }

  async addToRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<UserRole> {
    const existing = await this.findOne({
      where: { userId, roleId },
      transaction,
    });

    if (existing) return existing;

    const result = await this.create(
      { userId, roleId },
      undefined,
      transaction,
    );

    if (!result) throw new BadRequestException('Failed to add user to role');
    return result.entity;
  }

  async removeFromRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<boolean> {
    // Overriding delete logic for composite key
    const deleted = await UserRole.destroy({
      where: { userId, roleId },
      transaction,
    });
    return deleted > 0;
  }

  async getRolesForUser(userId: string): Promise<UserRole[]> {
    return this.findAll({
      where: { userId },
      include: ['role'],
    });
  }

  async getUsersInRole(roleId: string): Promise<UserRole[]> {
    return this.findAll({
      where: { roleId },
      include: ['user'],
    });
  }
}
