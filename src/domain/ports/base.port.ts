import {
  BulkCreateResult,
  BulkUpdateResult,
  CreateResult,
  DeleteResult,
  UpdateResult,
} from '../types';

export interface BasePort<T> {
  findAll(options?: any): Promise<T[]>;
  findById(id: string, options?: any): Promise<T | null>;
  findOne(options: any): Promise<T | null>;
  create(data: Partial<T>, transaction?: any): Promise<CreateResult<T> | null>;
  update(
    id: string,
    data: Partial<T>,
    transaction?: any,
  ): Promise<UpdateResult<T> | null>;
  delete(options?: any, transaction?: any): Promise<DeleteResult>;
  count(options?: any): Promise<number>;
  exists(options: any): Promise<boolean>;
  findByCondition(condition: any, options?: any): Promise<T | null>;
  bulkCreate(
    data: Partial<T>[],
    transaction?: any,
  ): Promise<BulkCreateResult<T>>;
  bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>,
    transaction?: any,
  ): Promise<BulkUpdateResult<T>>;
  bulkDelete(condition: any, transaction?: any): Promise<DeleteResult>;
}
