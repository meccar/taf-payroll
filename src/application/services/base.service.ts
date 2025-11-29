import {
  FindOptions,
  Transaction,
  WhereOptions,
  Model,
  ModelStatic,
} from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Sequelize } from 'sequelize-typescript';
import {
  EntityCreatedEvent,
  EntityDeletedEvent,
  EntityUpdatedEvent,
} from 'src/domain/events/entity.events';
import {
  AuditContext,
  BulkCreateResult,
  BulkUpdateResult,
  CreateResult,
  DeleteResult,
  UpdateResult,
} from 'src/domain/types/service.types';

export abstract class BaseService<T extends Model> {
  protected constructor(
    protected readonly model: ModelStatic<T>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly sequelize?: Sequelize,
  ) {}

  protected abstract getEntityName(): string;

  protected shouldAudit(): boolean {
    return true;
  }

  protected ensureSequelizeInstance(): Sequelize {
    if (!this.sequelize)
      throw new Error(
        'Sequelize instance is required for transaction support. Inject Sequelize in the service constructor.',
      );
    return this.sequelize;
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
  ): Promise<CreateResult<T> | null> {
    const entity = await this.model.create(data as T['_creationAttributes'], {
      transaction,
    });
    if (!entity) return null;

    if (this.shouldAudit())
      await this.eventEmitter.emitAsync(
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
          transaction,
        ),
      );

    return {
      entity,
      transaction,
    };
  }

  async update(
    id: string,
    data: Partial<T>,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<UpdateResult<T> | null> {
    const oldEntity = await this.model.findByPk(id, {
      paranoid: true,
      transaction,
    });
    if (!oldEntity) return null;

    const oldValue: unknown = oldEntity.toJSON();
    const updatedEntity = await oldEntity.update(data, { transaction });
    const updatedValue: unknown = updatedEntity.toJSON();

    if (this.shouldAudit())
      await this.eventEmitter.emitAsync(
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
          transaction,
        ),
      );

    return {
      entity: updatedEntity,
      transaction,
    };
  }

  async delete(
    condition: WhereOptions,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<DeleteResult> {
    const entity = await this.model.findOne({
      where: condition,
      paranoid: true,
      transaction,
    });
    if (!entity) return { success: false, transaction };

    const oldValue: unknown = entity.toJSON();
    await entity.destroy({ transaction, force: false });

    if (this.shouldAudit())
      await this.eventEmitter.emitAsync(
        'entity.deleted',
        new EntityDeletedEvent(
          this.getEntityName(),
          entity.getDataValue('id') as string,
          oldValue as Record<string, unknown>,
          context?.userId,
          {
            ipAddress: context?.ipAddress,
            requestId: context?.requestId,
            ...context?.metadata,
          },
          transaction,
        ),
      );

    return { success: true, transaction };
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

  async bulkCreate(
    dataArray: Partial<T>[],
    context?: AuditContext,
    transaction?: Transaction,
    options?: { ignoreDuplicates?: boolean },
  ): Promise<BulkCreateResult<T>> {
    if (dataArray.length === 0) return { entities: [], transaction };

    const entities = await this.model.bulkCreate(
      dataArray as T['_creationAttributes'][],
      {
        transaction,
        returning: true,
        ignoreDuplicates: options?.ignoreDuplicates,
      },
    );

    if (this.shouldAudit())
      for (const entity of entities) {
        await this.eventEmitter.emitAsync(
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
            transaction,
          ),
        );
      }

    return { entities, transaction };
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<BulkUpdateResult<T>> {
    if (updates.length === 0) return { entities: [], transaction };

    const updatedEntities: T[] = [];

    for (const { id, data } of updates) {
      const oldEntity = await this.model.findByPk(id, {
        paranoid: true,
        transaction,
      });

      if (!oldEntity) continue;

      const oldValue: unknown = oldEntity.toJSON();
      const updatedEntity = await oldEntity.update(data, { transaction });
      const updatedValue: unknown = updatedEntity.toJSON();

      if (this.shouldAudit())
        await this.eventEmitter.emitAsync(
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
            transaction,
          ),
        );

      updatedEntities.push(updatedEntity);
    }

    return { entities: updatedEntities, transaction };
  }

  async bulkDelete(
    condition: WhereOptions,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<DeleteResult> {
    const entities = await this.model.findAll({
      where: condition,
      transaction,
    });

    for (const entity of entities) {
      const oldValue: unknown = entity.toJSON();
      await entity.destroy({ transaction, force: false });

      if (this.shouldAudit())
        await this.eventEmitter.emitAsync(
          'entity.deleted',
          new EntityDeletedEvent(
            this.getEntityName(),
            entity.getDataValue('id') as string,
            oldValue as Record<string, unknown>,
            context?.userId,
            {
              ipAddress: context?.ipAddress,
              requestId: context?.requestId,
              ...context?.metadata,
            },
            transaction,
          ),
        );
    }

    return { success: true, transaction };
  }
}
