import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  PrimaryKey,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Role } from './role.entity';

@Table({
  tableName: 'user_roles',
  timestamps: false,
})
export class UserRole extends Model {
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
