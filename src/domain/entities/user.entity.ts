import { z } from 'zod';
import { BaseEntity, BaseEntitySchema } from './base.entity';
import { Role } from './role.entity';
import { UserClaim } from './user-claim.entity';
import { UserLogin } from './user-login.entity';
import { UserToken } from './user-token.entity';

const UserName = z.string().trim().min(1).max(256).nullable();
const Email = z.email().max(256).nullable();
const PhoneNumber = z.string().max(32).nullable();

export const UserSchema = BaseEntitySchema.extend({
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
});

export type IUser = z.infer<typeof UserSchema>;

export class User extends BaseEntity<IUser> implements IUser {
  userName!: string | null;
  normalizedUserName!: string | null;
  email!: string | null;
  normalizedEmail!: string | null;
  emailConfirmed!: boolean;
  passwordHash!: string;
  securityStamp!: string | null;
  concurrencyStamp: string | null;
  phoneNumber!: string | null;
  phoneNumberConfirmed!: boolean;
  twoFactorEnabled!: boolean;
  lockoutEnd!: Date | null;
  lockoutEnabled!: boolean;
  accessFailedCount!: number;
  roles: Role[];
  claims: UserClaim[];
  logins: UserLogin[];
  tokens: UserToken[];

  constructor(data: Partial<IUser>) {
    super(UserSchema, data);
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

  canLogin(): boolean {
    return this.isActive() && !this.isLockedOut() && this.isEmailVerified();
  }

  incrementFailedAccess(): void {
    this.accessFailedCount++;
    if (this.accessFailedCount >= 5) {
      this.lockAccount(new Date(Date.now() + 30 * 60 * 1000));
    }
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

  normalizeFields(): void {
    this.normalizedUserName = this.userName?.toUpperCase() ?? null;
    this.normalizedEmail = this.email?.toUpperCase() ?? null;
  }

  updateEmail(newEmail: string): void {
    this.email = newEmail;
    this.normalizedEmail = newEmail.toUpperCase();
    this.emailConfirmed = false;
  }

  override deactivate(): void {
    super.deactivate();
    this.lockoutEnabled = true;
  }

  override activate(): void {
    super.activate();
    this.unlockAccount();
  }

  static field = (...args: Parameters<typeof BaseEntity.fieldName>) =>
    BaseEntity.fieldName<IUser>(...args);
}
