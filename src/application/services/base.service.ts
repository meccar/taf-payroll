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
    if (!this.sequelize) {
      throw new Error(
        'Sequelize instance is required for transaction support. Inject Sequelize in the service constructor.',
      );
    }

    const transaction = await this.sequelize.transaction();

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
    if (!this.sequelize) {
      throw new Error(
        'Sequelize instance is required for transaction support. Inject Sequelize in the service constructor.',
      );
    }

    const transaction = await this.sequelize.transaction();

    try {
      // Get old entity before update for audit
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

      // Emit audit event explicitly
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
    if (!this.sequelize) {
      throw new Error(
        'Sequelize instance is required for transaction support. Inject Sequelize in the service constructor.',
      );
    }

    const transaction = await this.sequelize.transaction();

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
}
