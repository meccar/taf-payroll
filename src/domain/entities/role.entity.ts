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
import { BaseEntity } from './base.entity';
import { RoleClaim } from './role-claim.entity';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';

@Table({
  tableName: 'roles',
})
export class Role extends BaseEntity {
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
