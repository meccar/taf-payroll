import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

export const ProfileSchema = BaseEntitySchema.extend({
  userId: z.ulid(),
  firstName: z.string().trim().min(1).max(128),
  lastName: z.string().trim().min(1).max(128),
  phoneNumber: z.string().trim().min(1).max(128),
  address: z.string().trim().min(1).max(128),
  city: z.string().trim().min(1).max(128),
  state: z.string().trim().min(1).max(128),
  zipCode: z.string().trim().min(1).max(128),
  country: z.string().trim().min(1).max(128),
});

export type IProfile = z.infer<typeof ProfileSchema>;

export class Profile extends BaseEntity<IProfile> implements IProfile {
  declare userId: string;
  declare firstName: string;
  declare lastName: string;
  declare phoneNumber: string;
  declare address: string;
  declare city: string;
  declare state: string;
  declare zipCode: string;
  declare country: string;

  constructor(data: Partial<IProfile>) {
    super(ProfileSchema, data);
  }
}
