import {
  FindOptions,
  Transaction,
  WhereOptions,
  Model,
  ModelStatic,
} from 'sequelize';
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
    protected readonly model: ModelStatic<T>,
    protected readonly eventEmitter: EventEmitter2,
  ) {}

  protected abstract getEntityName(): string;

  protected shouldAudit(): boolean {
    return true;
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async findById(id: string, options?: FindOptions): Promise<T | null> {
    return this.model.findByPk(id, {
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async findOne(options: FindOptions): Promise<T | null> {
    return this.model.findOne({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async create(
    data: Partial<T>,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<T | null> {
    const entity = await this.model.create(data as T['_creationAttributes'], {
      transaction,
    });
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
    const oldEntity = await this.model.findByPk(id, {
      paranoid: true,
    });
    if (!oldEntity) return null;

    const oldValue: unknown = oldEntity.toJSON();
    const updatedEntity = await oldEntity.update(data, { transaction });
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
    const entity = await this.model.findByPk(id, {
      paranoid: true,
    });
    if (!entity) return false;

    const oldValue: unknown = entity.toJSON();
    await entity.destroy({ transaction, force: false });

    if (this.shouldAudit())
      this.eventEmitter.emit(
        'entity.deleted',
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

    return true;
  }

  async count(options?: FindOptions): Promise<number> {
    return this.model.count({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }

  async exists(id: string): Promise<boolean> {
    const entity = await this.model.findByPk(id, {
      paranoid: true,
    });
    return entity != null;
  }

  async findByCondition(
    condition: WhereOptions,
    options?: FindOptions,
  ): Promise<T | null> {
    return this.model.findOne({
      where: condition,
      ...options,
      paranoid: options?.paranoid ?? true,
    });
  }
}
