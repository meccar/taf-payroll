import { Model } from 'sequelize';

type PlainObject<T> = T extends Model<infer A, any> ? A : never;

export class AutoMapper {
  /** Convert Sequelize model → Domain Entity */
  static toEntity<M extends Model, E>(
    EntityClass: new (data: PlainObject<M>) => E,
    model: M,
  ): E {
    const plain = model.get({ plain: true }) as PlainObject<M>;
    return new EntityClass(plain);
  }

  /** Convert Domain Entity → plain model object */
  static toModel<T extends object>(entity: T): Partial<T> {
    const result: Partial<T> = {};

    (Object.keys(entity) as (keyof T)[]).forEach((key) => {
      const value = entity[key];
      if (typeof value !== 'function') {
        result[key] = value;
      }
    });

    return result;
  }
}
