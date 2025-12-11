import {
  BulkCreateResult,
  BulkUpdateResult,
  CreateResult,
  DeleteResult,
  UpdateResult,
} from '../types';

export abstract class BaseAdapter<EntityType> {
  abstract findAll(options?: any): Promise<EntityType[]>;
  abstract findById(id: string, options?: any): Promise<EntityType | null>;
  abstract findOne(options: any): Promise<EntityType | null>;
  abstract create(
    data: Partial<EntityType>,
    transaction?: any,
  ): Promise<CreateResult<EntityType> | null>;
  abstract update(
    id: string,
    data: Partial<EntityType>,
    transaction?: any,
  ): Promise<UpdateResult<EntityType> | null>;
  abstract delete(options?: any, transaction?: any): Promise<DeleteResult>;
  abstract count(options?: any): Promise<number>;
  abstract exists(options: any): Promise<boolean>;
  abstract findByCondition(
    condition: any,
    options?: any,
  ): Promise<EntityType | null>;
  abstract bulkCreate(
    data: Partial<EntityType>[],
    transaction?: any,
  ): Promise<BulkCreateResult<EntityType>>;
  abstract bulkUpdate(
    updates: Array<{ id: string; data: Partial<EntityType> }>,
    transaction?: any,
  ): Promise<BulkUpdateResult<EntityType>>;
  abstract bulkDelete(condition: any, transaction?: any): Promise<DeleteResult>;
}
