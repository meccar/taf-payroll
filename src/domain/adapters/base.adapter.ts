import {
  BulkCreateResult,
  BulkUpdateResult,
  CreateResult,
  DeleteResult,
  UpdateResult,
} from '../types';

export abstract class BaseAdapter<T> {
  abstract findAll(options?: any): Promise<T[]>;
  abstract findById(id: string, options?: any): Promise<T | null>;
  abstract findOne(options: any): Promise<T | null>;
  abstract create(
    data: Partial<T>,
    transaction?: any,
  ): Promise<CreateResult<T> | null>;
  abstract update(
    id: string,
    data: Partial<T>,
    transaction?: any,
  ): Promise<UpdateResult<T> | null>;
  abstract delete(options?: any, transaction?: any): Promise<DeleteResult>;
  abstract count(options?: any): Promise<number>;
  abstract exists(options: any): Promise<boolean>;
  abstract findByCondition(condition: any, options?: any): Promise<T | null>;
  abstract bulkCreate(
    data: Partial<T>[],
    transaction?: any,
  ): Promise<BulkCreateResult<T>>;
  abstract bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>,
    transaction?: any,
  ): Promise<BulkUpdateResult<T>>;
  abstract bulkDelete(condition: any, transaction?: any): Promise<DeleteResult>;
}
