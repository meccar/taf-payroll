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

type UserClaimInstance = InstanceType<typeof UserClaim>;
type UserLoginInstance = InstanceType<typeof UserLogin>;
type UserTokenInstance = InstanceType<typeof UserToken>;
type RoleInstance = InstanceType<typeof Role>;

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends BaseModel {
  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare userName?: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare normalizedUserName?: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare email?: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(256) })
  declare normalizedEmail?: string;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare emailConfirmed: boolean;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  declare passwordHash?: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  declare securityStamp?: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  declare concurrencyStamp?: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(32) })
  declare phoneNumber?: string;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare phoneNumberConfirmed: boolean;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare twoFactorEnabled: boolean;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  declare lockoutEnd?: Date;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare lockoutEnabled: boolean;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  declare accessFailedCount: number;

  @HasMany((): typeof UserClaim => {
    return UserClaim;
  })
  declare claims?: UserClaimInstance[];

  @HasMany((): typeof UserLogin => {
    return UserLogin;
  })
  declare logins?: UserLoginInstance[];

  @HasMany((): typeof UserToken => {
    return UserToken;
  })
  declare tokens?: UserTokenInstance[];

  @BelongsToMany(
    (): typeof Role => {
      return Role;
    },
    (): typeof UserRole => {
      return UserRole;
    },
  )
  declare roles?: RoleInstance[];
}
