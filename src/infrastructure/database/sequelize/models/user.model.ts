import {
  Table,
  Column,
  DataType,
  Default,
  AllowNull,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Role } from './role.model';
import { UserRole } from './user-role.model';
import { UserClaim } from './user-claim.model';
import { UserLogin } from './user-login.model';
import { UserToken } from './user-token.model';
import { IUser } from 'src/domain/entities';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends BaseModel implements IUser {
  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare userName: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare normalizedUserName: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare email: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare normalizedEmail: string | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare emailConfirmed: boolean;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  declare passwordHash: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  declare securityStamp: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  declare concurrencyStamp: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(32) })
  declare phoneNumber: string | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare phoneNumberConfirmed: boolean;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare twoFactorEnabled: boolean;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  declare lockoutEnd: Date | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare lockoutEnabled: boolean;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  declare accessFailedCount: number;

  @HasMany((): typeof UserClaim => {
    return UserClaim;
  })
  declare claims?: InstanceType<typeof UserClaim>[];

  @HasMany((): typeof UserLogin => {
    return UserLogin;
  })
  declare logins?: InstanceType<typeof UserLogin>[];

  @HasMany((): typeof UserToken => {
    return UserToken;
  })
  declare tokens?: InstanceType<typeof UserToken>[];

  @BelongsToMany(
    (): typeof Role => {
      return Role;
    },
    (): typeof UserRole => {
      return UserRole;
    },
  )
  declare roles?: InstanceType<typeof Role>[];
}
