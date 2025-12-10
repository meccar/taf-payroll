import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

export const UserLoginSchema = BaseEntitySchema.extend({
  loginProvider: z.string().trim().min(1).max(128),
  providerKey: z.string().trim().min(1).max(128),
  providerDisplayName: z.string().nullable(),
  userId: z.ulid(),
});

export type IUserLogin = z.infer<typeof UserLoginSchema>;

export class UserLogin extends BaseEntity<IUserLogin> implements IUserLogin {
  loginProvider: string;
  providerKey: string;
  providerDisplayName: string | null;
  userId: string;

  constructor(data: Partial<IUserLogin>) {
    super(UserLoginSchema, data);
  }
}
