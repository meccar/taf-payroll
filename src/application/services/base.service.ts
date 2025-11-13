import { FindOptions, Transaction, WhereOptions, Model } from 'sequelize';
import { IBaseRepository } from '../../domain/repositories';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EntityCreatedEvent,
  EntityDeletedEvent,
  EntityUpdatedEvent,
} from 'src/domain/events/entity.events';

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseService<T extends Model> {
  protected constructor(
    protected readonly repository: IBaseRepository<T>,
    protected readonly eventEmitter: EventEmitter2,
  ) {}

  protected abstract getEntityName(): string;

  protected shouldAudit(): boolean {
    return true;
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.repository.findAll(options);
  }

  async findById(id: string, options?: FindOptions): Promise<T | null> {
    return this.repository.findById(id, options);
  }

  async findOne(options: FindOptions): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async create(
    data: Partial<T>,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<T | null> {
    const entity = await this.repository.create(data, transaction);
    if (!entity) return null;

    if (this.shouldAudit())
      this.eventEmitter.emit(
        'entity.created',
        new EntityCreatedEvent(
          this.getEntityName(),
          entity.getDataValue('id') as string,
          entity.toJSON(),
          context?.userId,
          {
            ipAddress: context?.ipAddress,
            requestId: context?.requestId,
            ...context?.metadata,
          },
        ),
      );

    return entity;
  }

  async update(
    id: string,
    data: Partial<T>,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<T | null> {
    const oldEntity = await this.repository.findById(id);
    if (!oldEntity) return null;

    const oldValue: unknown = oldEntity.toJSON();
    const updatedEntity = await this.repository.update(id, data, transaction);
    const updatedValue: unknown = updatedEntity.toJSON();

    if (this.shouldAudit())
      this.eventEmitter.emit(
        'entity.updated',
        new EntityUpdatedEvent(
          this.getEntityName(),
          id,
          oldValue as Record<string, unknown>,
          updatedValue as Record<string, unknown>,
          context?.userId,
          {
            ipAddress: context?.ipAddress,
            requestId: context?.requestId,
            ...context?.metadata,
          },
        ),
      );

    return updatedEntity;
  }

  async delete(
    id: string,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (!entity) return false;

    const oldValue: unknown = entity.toJSON();
    const result = await this.repository.delete(id, transaction);

    if (result && this.shouldAudit())
      this.eventEmitter.emit(
        'entity.deleted',
        new EntityDeletedEvent(
          this.getEntityName(),
          id,
          oldValue,
          context?.userId,
          {
            ipAddress: context?.ipAddress,
            requestId: context?.requestId,
            ...context?.metadata,
          },
        ),
      );

    return result;
  }

  async softDelete(
    id: string,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (!entity) return false;

    const oldValue: unknown = entity.toJSON();
    const result = await this.repository.softDelete(id, transaction);

    if (result && this.shouldAudit())
      this.eventEmitter.emit(
        `${this.getEntityName()}.deleted`,
        new EntityDeletedEvent(
          this.getEntityName(),
          id,
          oldValue as Record<string, unknown>,
          context?.userId,
          {
            ipAddress: context?.ipAddress,
            requestId: context?.requestId,
            ...context?.metadata,
          },
        ),
      );

    return result;
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
