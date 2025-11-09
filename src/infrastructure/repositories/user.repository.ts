import { Injectable } from '@nestjs/common';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { User, Role, UserRole, UserClaim } from '../../domain/entities';
import { IUserRepository } from '../../domain/repositories';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  constructor() {
    super(User);
  }

  async findByEmail(
    email: string,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.findOne({
      where: { normalizedEmail: email.toUpperCase() },
      ...options,
    });
  }

  async findByUserName(
    userName: string,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.findOne({
      where: { normalizedUserName: userName.toUpperCase() },
      ...options,
    });
  }

  async addToRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<void> {
    await UserRole.create(
      {
        userId,
        roleId,
      },
      { transaction },
    );
  }

  async removeFromRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<void> {
    await UserRole.destroy({
      where: { userId, roleId },
      transaction,
    });
  }

  async getRoles(userId: string, options?: FindOptions): Promise<Role[]> {
    const user = await this.findById(userId, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
      ...options,
    });
    return user?.roles ?? [];
  }

  async findByClaim(
    claim: WhereOptions,
    options?: FindOptions,
  ): Promise<User | null> {
    return this.findOne({
      include: [
        {
          model: UserClaim,
          where: claim,
        },
      ],
      ...options,
    });
  }
}
