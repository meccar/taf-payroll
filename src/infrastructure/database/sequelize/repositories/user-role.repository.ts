import { BadRequestException, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { DeleteResult } from 'src/domain/types';
import { BaseRepository } from './base.repository';
import { UserRole } from '../models';
import { UserRole as UserRoleEntity } from 'src/domain/entities';
import { UserRoleAdapter } from 'src/domain/adapters';

@Injectable()
export class UserRoleRepository
  extends BaseRepository<UserRole, UserRoleEntity>
  implements UserRoleAdapter
{
  constructor() {
    super(UserRole, UserRoleEntity);
  }

  protected getEntityName(): string {
    return UserRole.name;
  }

  async addToRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<UserRoleEntity> {
    const existing = await this.findOne({
      where: { userId, roleId },
      transaction,
    });

    if (existing) throw new BadRequestException(MESSAGES.ERR_VALIDATION_FAILED);

    const result = await this.create({ userId, roleId }, transaction);

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

  public async getAllUserRoles(): Promise<UserRoleEntity[]> {
    return this.findAll();
  }

  public async getRolesForUser(userId: string): Promise<UserRoleEntity[]> {
    return this.findAll({
      where: { userId },
      include: ['role'],
    });
  }

  public async updateUserRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<UserRoleEntity> {
    const result = await this.update(roleId, { roleId, userId }, transaction);

    if (!result) throw new BadRequestException(MESSAGES.ERR_UPDATE_FAILED);

    return result.entity;
  }

  async getUsersByRole(roleId: string): Promise<UserRoleEntity[]> {
    return this.findAll({
      where: { roleId },
      include: ['user'],
    });
  }

  async getRolesByUser(userId: string): Promise<UserRoleEntity[]> {
    return this.findAll({
      where: { userId },
      include: ['role'],
    });
  }
}
