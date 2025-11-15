import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Role } from './role.entity';
import { BaseEntity } from './base.entity';

@Table({
  tableName: 'role_claims',
  timestamps: true,
  paranoid: true,
})
export class RoleClaim extends BaseEntity {
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
