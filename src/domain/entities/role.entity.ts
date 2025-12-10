import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

export const RoleSchema = BaseEntitySchema.extend({
  name: z.string().trim().min(1).max(256),
  normalizedName: z.string().trim().min(1).max(256),
  concurrencyStamp: z.string().nullable(),
});

export type IRole = z.infer<typeof RoleSchema>;

export class Role extends BaseEntity<IRole> implements IRole {
  name: string;
  normalizedName: string;
  concurrencyStamp: string | null;

  constructor(data: Partial<IRole>) {
    super(RoleSchema, data);
  }
}
