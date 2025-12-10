import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

export const RoleClaimSchema = BaseEntitySchema.extend({
  roleId: z.ulid(),
  claimType: z.string().nullable(),
  claimValue: z.string().nullable(),
});

export type IRoleClaim = z.infer<typeof RoleClaimSchema>;
export class RoleClaim extends BaseEntity<IRoleClaim> implements IRoleClaim {
  roleId: string;
  claimType: string | null;
  claimValue: string | null;

  constructor(data: Partial<IRoleClaim>) {
    super(RoleClaimSchema, data);
  }
}
