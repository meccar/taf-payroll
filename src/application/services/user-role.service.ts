import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from 'sequelize';
import { UserRole } from '../../domain/entities';
import { BaseService } from './base.service';
import { MESSAGES } from 'src/shared/messages';
import { DeleteResult } from 'src/domain/types';

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

    if (existing) throw new BadRequestException(MESSAGES.ERR_VALIDATION_FAILED);

    const result = await this.create(
      { userId, roleId },
      undefined,
      transaction,
    );

    if (!result)
      throw new BadRequestException(MESSAGES.ERR_FAILED_TO_CREATE_USER_ROLE);
    return result.entity;
  }

  async removeFromRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<DeleteResult> {
    return await this.delete({
      where: { userId, roleId },
      transaction,
    });
  }

  public async getAllUserRoles(): Promise<UserRole[]> {
    return this.findAll();
  }

  public async getRolesForUser(userId: string): Promise<UserRole[]> {
    return this.findAll({
      where: { userId },
      include: ['role'],
    });
  }

  public async updateUserRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<UserRole> {
    const result = await this.update(
      roleId,
      { roleId, userId },
      undefined,
      transaction,
    );

    if (!result) throw new BadRequestException(MESSAGES.ERR_UPDATE_FAILED);

    return result.entity;
  }

  async getUsersByRole(roleId: string): Promise<UserRole[]> {
    return this.findAll({
      where: { roleId },
      include: ['user'],
    });
  }

  async getRolesByUser(userId: string): Promise<UserRole[]> {
    return this.findAll({
      where: { userId },
      include: ['role'],
    });
  }
}
