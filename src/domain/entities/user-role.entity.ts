import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';
import { Role } from './role.entity';

export const UserRoleSchema = BaseEntitySchema.extend({
  userId: z.ulid(),
  roleId: z.ulid(),
});

export type IUserRole = z.infer<typeof UserRoleSchema>;

export class UserRole extends BaseEntity<IUserRole> implements IUserRole {
  userId: string;
  roleId: string;
  role: Role;

  constructor(data: Partial<IUserRole>) {
    super(UserRoleSchema, data);
  }
}
