import { z } from 'zod';
import { ulid } from 'ulid';

const ID = z.ulid();
const UserName = z.string().trim().min(1).max(256).nullable();
const Email = z.email().max(256).nullable();
const PhoneNumber = z.string().max(32).nullable();

export const UserEntity = z.object({
  id: ID,
  userName: UserName,
  normalizedUserName: UserName,
  email: Email,
  normalizedEmail: Email,
  emailConfirmed: z.boolean().default(false),
  passwordHash: z.string().nullable(),
  securityStamp: z.string().nullable(),
  concurrencyStamp: z.string().nullable(),
  phoneNumber: PhoneNumber,
  phoneNumberConfirmed: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  lockoutEnd: z.date().nullable(),
  lockoutEnabled: z.boolean().default(false),
  accessFailedCount: z.number().int().min(0).default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable(),
});

export type IUser = z.infer<typeof UserEntity>;

export class User implements IUser {
  id!: string;
  userName!: string | null;
  normalizedUserName!: string | null;
  email!: string | null;
  normalizedEmail!: string | null;
  emailConfirmed!: boolean;
  passwordHash!: string | null;
  securityStamp!: string | null;
  concurrencyStamp!: string | null;
  phoneNumber!: string | null;
  phoneNumberConfirmed!: boolean;
  twoFactorEnabled!: boolean;
  lockoutEnd!: Date | null;
  lockoutEnabled!: boolean;
  accessFailedCount!: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt!: Date | null;

  constructor(data: Partial<IUser>) {
    this.id = data.id ?? ulid();

    const validated = UserEntity.parse({
      ...data,
      id: this.id,
    });

    Object.assign(this, validated);
  }

  isEmailVerified(): boolean {
    return this.emailConfirmed && !!this.email;
  }

  isLockedOut(): boolean {
    return (
      this.lockoutEnabled &&
      this.lockoutEnd !== null &&
      this.lockoutEnd > new Date()
    );
  }

  lockAccount(until: Date): void {
    this.lockoutEnabled = true;
    this.lockoutEnd = until;
  }

  unlockAccount(): void {
    this.lockoutEnabled = false;
    this.lockoutEnd = null;
    this.accessFailedCount = 0;
  }

  toObject(): IUser {
    return UserEntity.parse(this);
  }
}
