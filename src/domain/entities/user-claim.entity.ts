import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Table({
  tableName: 'user_claims',
  timestamps: true,
  paranoid: true,
})
export class UserClaim extends BaseEntity {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare claimType?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare claimValue?: string;

  @BelongsTo(() => User)
  declare user: User;
}
