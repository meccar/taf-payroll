import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

export const UserClaimSchema = BaseEntitySchema.extend({
  userId: z.ulid(),
  claimType: z.string().nullable(),
  claimValue: z.string().nullable(),
});

export type IUserClaim = z.infer<typeof UserClaimSchema>;

export class UserClaim extends BaseEntity<IUserClaim> implements IUserClaim {
  userId: string;
  claimType: string | null;
  claimValue: string | null;

  constructor(data: Partial<IUserClaim>) {
    super(UserClaimSchema, data);
  }
}
