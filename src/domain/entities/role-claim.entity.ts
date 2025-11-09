import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  Model,
} from 'sequelize-typescript';
import { Role } from './role.entity';

@Table({
  tableName: 'role_claims',
  timestamps: false,
})
export class RoleClaim extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => Role)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare roleId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare claimType?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare claimValue?: string;

  @BelongsTo(() => Role)
  declare role: Role;
}
