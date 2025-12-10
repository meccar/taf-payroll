import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

export const UserTokenSchema = BaseEntitySchema.extend({
  userId: z.ulid(),
  loginProvider: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(128),
  value: z.string().nullable(),
});

export type IUserToken = z.infer<typeof UserTokenSchema>;

export class UserToken extends BaseEntity<IUserToken> implements IUserToken {
  declare userId: string;
  declare loginProvider: string;
  declare name: string;
  declare value: string | null;

  constructor(data: Partial<IUserToken>) {
    super(UserTokenSchema, data);
  }
}
