import {
  FindOptions,
  Transaction,
  WhereOptions,
  Model,
  ModelStatic,
} from 'sequelize';
import { BaseAdapter } from 'src/domain/adapters';
import {
  BulkCreateResult,
  BulkUpdateResult,
  CreateResult,
  DeleteResult,
  UpdateResult,
} from 'src/domain/types/service.type';
import { AutoMapper } from '../mapper';

export abstract class BaseRepository<ModelType extends Model, EntityType>
  implements BaseAdapter<EntityType>
{
  protected constructor(
    protected readonly model: ModelStatic<ModelType>,
    private EntityClass: new (data: any) => EntityType,
  ) {}

  protected abstract getEntityName(): string;

  async findAll(options?: FindOptions): Promise<EntityType[]> {
    const models = await this.model.findAll({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
    return models.map((m) => AutoMapper.toEntity(this.EntityClass, m));
  }

  async findById(
    id: string,
    options?: FindOptions,
  ): Promise<EntityType | null> {
    const model = await this.model.findByPk(id, {
      ...options,
      paranoid: options?.paranoid ?? true,
    });
    return model ? AutoMapper.toEntity(this.EntityClass, model) : null;
  }

  async findOne(options: FindOptions): Promise<EntityType | null> {
    const model = await this.model.findOne({
      ...options,
      paranoid: options?.paranoid ?? true,
    });
    return model ? AutoMapper.toEntity(this.EntityClass, model) : null;
  }

  async create(
    data: Partial<EntityType>,
    transaction?: Transaction,
  ): Promise<CreateResult<EntityType> | null> {
    const model = await this.model.create(
      data as ModelType['_creationAttributes'],
      {
        transaction,
      },
    );
    if (!model) return null;

    return {
      entity: AutoMapper.toEntity(this.EntityClass, model),
      transaction,
    };
  }

  async update(
    id: string,
    data: Partial<EntityType>,
    transaction?: Transaction,
  ): Promise<UpdateResult<EntityType> | null> {
    const oldModel = await this.model.findByPk(id, {
      paranoid: true,
      transaction,
    });

    if (!oldModel) return null;

    const updatedModel = await oldModel.update(data, { transaction });

    return {
      entity: AutoMapper.toEntity(this.EntityClass, updatedModel),
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
  ): Promise<EntityType | null> {
    const model = await this.model.findOne({
      where: condition,
      ...options,
      paranoid: options?.paranoid ?? true,
    });
    return model ? AutoMapper.toEntity(this.EntityClass, model) : null;
  }

  async bulkCreate(
    dataArray: Partial<EntityType>[],
    transaction?: Transaction,
    options?: { ignoreDuplicates?: boolean },
  ): Promise<BulkCreateResult<EntityType>> {
    if (dataArray.length === 0) return { entities: [], transaction };

    const models = await this.model.bulkCreate(
      dataArray as ModelType['_creationAttributes'][],
      {
        transaction,
        returning: true,
        ignoreDuplicates: options?.ignoreDuplicates,
      },
    );

    return {
      entities: models.map((model) =>
        AutoMapper.toEntity(this.EntityClass, model),
      ),
      transaction,
    };
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<EntityType> }>,
    transaction?: Transaction,
  ): Promise<BulkUpdateResult<EntityType>> {
    if (updates.length === 0) return { entities: [], transaction };

    const updatedModels: ModelType[] = [];

    for (const { id, data } of updates) {
      const oldEntity = await this.model.findByPk(id, {
        paranoid: true,
        transaction,
      });

      if (!oldEntity) continue;

      const updatedEntity = await oldEntity.update(data, { transaction });

      updatedModels.push(updatedEntity);
    }

    return {
      entities: updatedModels.map((model) =>
        AutoMapper.toEntity(this.EntityClass, model),
      ),
      transaction,
    };
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
