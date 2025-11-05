import { FindOptions, Transaction } from 'sequelize';
import { BaseEntity } from '../entities/base.entity';

export interface IBaseRepository<T extends BaseEntity = BaseEntity> {
  findAll(options?: FindOptions): Promise<T[]>;
  findById(id: string, options?: FindOptions): Promise<T | null>;
  findOne(options: FindOptions): Promise<T | null>;
  create(data: Partial<T>, transaction?: Transaction): Promise<T>;
  update(id: string, data: Partial<T>, transaction?: Transaction): Promise<T>;
  delete(id: string, transaction?: Transaction): Promise<boolean>;
  softDelete(id: string, transaction?: Transaction): Promise<boolean>;
  count(options?: FindOptions): Promise<number>;
  exists(id: string): Promise<boolean>;
}
