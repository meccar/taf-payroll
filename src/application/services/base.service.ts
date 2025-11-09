import { FindOptions, Transaction, WhereOptions, Model } from 'sequelize';
import { IBaseRepository } from '../../domain/repositories';

export abstract class BaseService<T extends Model> {
  protected constructor(protected readonly repository: IBaseRepository<T>) {}

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.repository.findAll(options);
  }

  async findById(id: string, options?: FindOptions): Promise<T | null> {
    return this.repository.findById(id, options);
  }

  async findOne(options: FindOptions): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async create(data: Partial<T>, transaction?: Transaction): Promise<T> {
    return this.repository.create(data, transaction);
  }

  async update(
    id: string,
    data: Partial<T>,
    transaction?: Transaction,
  ): Promise<T> {
    return this.repository.update(id, data, transaction);
  }

  async delete(id: string, transaction?: Transaction): Promise<boolean> {
    return this.repository.delete(id, transaction);
  }

  async softDelete(id: string, transaction?: Transaction): Promise<boolean> {
    return this.repository.softDelete(id, transaction);
  }

  async count(options?: FindOptions): Promise<number> {
    return this.repository.count(options);
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  async findByCondition(
    condition: WhereOptions,
    options?: FindOptions,
  ): Promise<T | null> {
    return this.repository.findOne({ where: condition, ...options });
  }
}
