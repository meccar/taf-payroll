/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ulid } from 'ulid';
import { DateUtils } from 'src/shared/utils';
import z from 'zod';

// export abstract class BaseEntity extends Model {
//   @PrimaryKey
//   @Column({
//     type: DataTypes.STRING(26),
//     defaultValue: () => ulid(),
//   })
//   declare id: string;

//   @Column({ field: 'created_by', allowNull: true })
//   declare createdBy?: string;

//   @Column({ field: 'updated_by', allowNull: true })
//   declare updatedBy?: string;
// }

export const setEntityID = (entity: { _id?: string; id?: string }) => {
  Object.assign(entity, { id: [entity?.id, entity?._id, null].find(Boolean) });
  return entity;
};

export interface IEntity {
  id: string;

  createdAt?: Date | null | undefined;

  updatedAt?: Date | null | undefined;

  deletedAt?: Date | null | undefined;
}

export const BaseEntity = <T>() => {
  abstract class Entity implements IEntity {
    protected constructor(readonly _schema: z.ZodSchema) {
      if (!_schema) throw new Error('BaseEntity requires a schema');
    }

    readonly id!: string;

    readonly createdAt?: Date | null | undefined;

    readonly updatedAt?: Date | null | undefined;

    deletedAt?: Date | null | undefined;

    static nameOf = <D = keyof T>(name: keyof T) => name as D;

    deactivated() {
      this.deletedAt = DateUtils.getJSDate();
    }

    activated() {
      Object.assign(this, { deletedAt: null });
    }

    validate<T>(entity: T): T {
      setEntityID(entity as IEntity);
      const parsed = this._schema.parse(entity) as T;
      Object.assign(this, parsed);
      return parsed;
    }

    assignIDWhenMissing() {
      if (!this.id) {
        const id = ulid();
        Object.assign(this, { id });
      }
    }

    toObject() {
      return this._schema.safeParse(this).data as T;
    }

    toJson() {
      return JSON.stringify(this.toObject());
    }

    clone(): this {
      const obj = this.toObject();
      return new (this.constructor as new (entity: T) => this)(obj);
    }
  }

  return Entity;
};
