import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

export const UserRoleSchema = BaseEntitySchema.extend({
  userId: z.ulid(),
  roleId: z.ulid(),
});

export type IUserRole = z.infer<typeof UserRoleSchema>;

export class UserRole extends BaseEntity<IUserRole> implements IUserRole {
  userId: string;
  roleId: string;

  constructor(data: Partial<IUserRole>) {
    super(UserRoleSchema, data);
  }
}
