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
  CreateResult,
  UpdateResult,
  DeleteResult,
  BulkCreateResult,
  BulkUpdateResult,
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

  async createWithTransaction(
    data: Partial<T>,
    context?: AuditContext,
  ): Promise<CreateResult<T> | null> {
    const sequelize = this.ensureSequelizeInstance();
    const transaction = await sequelize.transaction();

    try {
      const entity = await this.create(data, context, transaction);
      if (!entity) {
        await transaction.rollback();
        return null;
      }

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

      return {
        entity,
        transaction,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<T>,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<T | null> {
    const oldEntity = await this.model.findByPk(id, {
      paranoid: true,
      transaction,
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

  async updateWithTransaction(
    id: string,
    data: Partial<T>,
    context?: AuditContext,
  ): Promise<UpdateResult<T> | null> {
    const sequelize = this.ensureSequelizeInstance();
    const transaction = await sequelize.transaction();

    try {
      const oldEntity = await this.model.findByPk(id, {
        paranoid: true,
        transaction,
      });
      if (!oldEntity) {
        await transaction.rollback();
        return null;
      }

      const oldValue: unknown = oldEntity.toJSON();
      const entity = await this.update(id, data, context, transaction);
      if (!entity) {
        await transaction.rollback();
        return null;
      }

      const updatedValue: unknown = entity.toJSON();

      if (this.shouldAudit()) {
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
      }

      return {
        entity,
        transaction,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(
    id: string,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<boolean> {
    const entity = await this.model.findByPk(id, {
      paranoid: true,
      transaction,
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

  async deleteWithTransaction(
    id: string,
    context?: AuditContext,
  ): Promise<DeleteResult> {
    const sequelize = this.ensureSequelizeInstance();
    const transaction = await sequelize.transaction();

    try {
      const entity = await this.model.findByPk(id, {
        paranoid: true,
        transaction,
      });
      if (!entity) {
        await transaction.rollback();
        return {
          success: false,
          transaction,
        };
      }

      const oldValue: unknown = entity.toJSON();
      await entity.destroy({ transaction, force: false });

      if (this.shouldAudit()) {
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
      }

      return {
        success: true,
        transaction,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
  ): Promise<T[]> {
    if (dataArray.length === 0) return [];

    const entities = await this.model.bulkCreate(
      dataArray as T['_creationAttributes'][],
      {
        transaction,
        returning: true,
      },
    );

    if (this.shouldAudit()) {
      for (const entity of entities) {
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
      }
    }

    return entities;
  }

  async bulkCreateWithTransaction(
    dataArray: Partial<T>[],
    context?: AuditContext,
  ): Promise<BulkCreateResult<T>> {
    const sequelize = this.ensureSequelizeInstance();
    const transaction = await sequelize.transaction();

    try {
      const entities = await this.bulkCreate(dataArray, context, transaction);

      return {
        entities,
        transaction,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>,
    context?: AuditContext,
    transaction?: Transaction,
  ): Promise<T[]> {
    if (updates.length === 0) return [];

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

      if (this.shouldAudit()) {
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
      }

      updatedEntities.push(updatedEntity);
    }

    return updatedEntities;
  }

  async bulkUpdateWithTransaction(
    updates: Array<{ id: string; data: Partial<T> }>,
    context?: AuditContext,
  ): Promise<BulkUpdateResult<T>> {
    const sequelize = this.ensureSequelizeInstance();
    const transaction = await sequelize.transaction();

    try {
      const entities = await this.bulkUpdate(updates, context, transaction);

      return {
        entities,
        transaction,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
