import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Role } from './role.model';
import { BaseModel } from './base.model';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  paranoid: true,
})
export class UserRole extends BaseModel {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare userId: string;

  @PrimaryKey
  @ForeignKey(() => Role)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare roleId: string;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Role)
  declare role: Role;
}
