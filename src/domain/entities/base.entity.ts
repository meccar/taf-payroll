import { ulid } from 'ulid';
import { z } from 'zod';

export const BaseEntitySchema = z.object({
  id: z.ulid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export type IBaseEntity = z.infer<typeof BaseEntitySchema>;

export abstract class BaseEntity<T extends IBaseEntity> implements IBaseEntity {
  id!: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  protected constructor(
    protected readonly schema: z.ZodSchema<T>,
    data?: Partial<T>,
  ) {
    this.id = data?.id ?? ulid();

    const validated = this.schema.parse({
      ...data,
      id: this.id,
    } as T);

    Object.assign(this, validated);
  }

  deactivate(): void {
    this.deletedAt = new Date();
  }

  activate(): void {
    this.deletedAt = null;
  }

  isActive(): boolean {
    return this.deletedAt === null || this.deletedAt === undefined;
  }

  isDeleted(): boolean {
    return !this.isActive();
  }

  validate(): T {
    const validated = this.schema.parse(this);
    return validated;
  }

  toObject(): T {
    return this.schema.parse(this);
  }

  toJson(): string {
    return JSON.stringify(this.toObject());
  }

  clone(): this {
    const obj = this.toObject();
    return new (this.constructor as new (data: T) => this)(obj);
  }

  static fieldName<T>(name: keyof T): keyof T {
    return name;
  }
}
