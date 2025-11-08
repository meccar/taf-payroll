import { Injectable } from '@nestjs/common';
import { FindOptions, Model, Transaction, WhereOptions } from 'sequelize';
import { BaseEntity } from '../../domain/entities/base.entity';
import { IBaseRepository } from '../../domain/repositories/base.repository.interface';
import { REPOSITORY_MESSAGES } from '../../shared/messages/repository.messages';

@Injectable()
export abstract class BaseRepository<T extends BaseEntity = BaseEntity>
  implements IBaseRepository<T>
{
  constructor(protected readonly model: typeof Model & { new (): T }) {}

  async findAll(options?: FindOptions): Promise<T[]> {
    return await this.model.findAll({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async findById(id: string, options?: FindOptions): Promise<T | null> {
    return await this.model.findByPk(id, {
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async findOne(options: FindOptions): Promise<T | null> {
    return await this.model.findOne({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async create(data: Partial<T>, transaction?: Transaction): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.model.create(data as any, {
      transaction,
    });
  }

  async update(
    id: string,
    data: Partial<T>,
    transaction?: Transaction,
  ): Promise<T> {
    const instance = await this.findById(id);
    if (!instance) throw new Error(REPOSITORY_MESSAGES.ENTITY_NOT_FOUND(id));
    await instance.update(data, { transaction });
    return instance;
  }

  async delete(id: string, transaction?: Transaction): Promise<boolean> {
    const instance = await this.findById(id);
    if (!instance) return false;
    await instance.destroy({ transaction, force: true });
    return true;
  }

  async softDelete(id: string, transaction?: Transaction): Promise<boolean> {
    const instance = await this.findById(id);
    if (!instance) return false;
    await instance.destroy({ transaction, force: false });
    return true;
  }

  async count(options?: FindOptions): Promise<number> {
    return await this.model.count({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async exists(id: string): Promise<boolean> {
    const instance = await this.findById(id);
    return !!instance;
  }

  async findByCondition(condition: WhereOptions): Promise<T | null> {
    return await this.model.findOne({
      where: condition,
      paranoid: true,
    });
  }

  async findAllByCondition(
    condition: WhereOptions,
    options?: FindOptions,
  ): Promise<T[]> {
    return await this.model.findAll({
      where: condition,
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }
}
