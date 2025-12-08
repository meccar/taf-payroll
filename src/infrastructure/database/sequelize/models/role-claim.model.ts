import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { BaseModel } from './base.model';

@Table({
  tableName: 'role_claims',
  timestamps: true,
  paranoid: true,
})
export class RoleClaim extends BaseModel {
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
