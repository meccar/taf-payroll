import {
  FindOptions,
  Transaction,
  WhereOptions,
  Model,
  ModelStatic,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { BasePort } from 'src/domain/ports/base.port';
import {
  BulkCreateResult,
  BulkUpdateResult,
  CreateResult,
  DeleteResult,
  UpdateResult,
} from 'src/domain/types/service.types';

export abstract class BaseRepository<T extends Model> implements BasePort<T> {
  protected constructor(
    protected readonly model: ModelStatic<T>,
    protected readonly sequelize?: Sequelize,
  ) {}

  protected abstract getEntityName(): string;

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
    transaction?: Transaction,
  ): Promise<CreateResult<T> | null> {
    const entity = await this.model.create(data as T['_creationAttributes'], {
      transaction,
    });
    if (!entity) return null;

    return {
      entity,
      transaction,
    };
  }

  async update(
    id: string,
    data: Partial<T>,
    transaction?: Transaction,
  ): Promise<UpdateResult<T> | null> {
    const oldEntity = await this.model.findByPk(id, {
      paranoid: true,
      transaction,
    });

    if (!oldEntity) return null;

    const updatedEntity = await oldEntity.update(data, { transaction });

    return {
      entity: updatedEntity,
      transaction,
    };
  }

  async delete(
    condition: WhereOptions,
    transaction?: Transaction,
  ): Promise<DeleteResult> {
    const entity = await this.model.findOne({
      where: condition,
      paranoid: true,
      transaction,
    });
    if (!entity) return { success: false, transaction };

    await entity.destroy({ transaction, force: false });

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

    return { entities, transaction };
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>,
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

      const updatedEntity = await oldEntity.update(data, { transaction });

      updatedEntities.push(updatedEntity);
    }

    return { entities: updatedEntities, transaction };
  }

  async bulkDelete(
    condition: WhereOptions,
    transaction?: Transaction,
  ): Promise<DeleteResult> {
    const entities = await this.model.findAll({
      where: condition,
      transaction,
    });

    for (const entity of entities) {
      await entity.destroy({ transaction, force: false });
    }

    return { success: true, transaction };
  }
}
