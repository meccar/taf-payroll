import {
  Table,
  Column,
  DataType,
  AllowNull,
  Default,
  HasMany,
  BelongsToMany,
  Index,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { RoleClaim } from './role-claim.model';
import { User } from './user.model';
import { UserRole } from './user-role.model';

@Table({
  tableName: 'roles',
  timestamps: true,
  paranoid: true,
})
export class Role extends BaseModel {
  @AllowNull(false)
  @Column({ type: DataType.STRING(256) })
  declare name: string;

  @AllowNull(false)
  @Index({ unique: true })
  @Column({ type: DataType.STRING(256) })
  declare normalizedName: string;

  @Default(null)
  @Column({ type: DataType.STRING, allowNull: true })
  declare concurrencyStamp?: string | null;

  @HasMany(() => RoleClaim)
  declare claims: RoleClaim[];

  @BelongsToMany(() => User, () => UserRole)
  declare users: Array<User & { UserRole: UserRole }>;
}
