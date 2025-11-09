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
import { User } from './user.entity';

@Table({
  tableName: 'user_claims',
  timestamps: false,
})
export class UserClaim extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  declare id: number;

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
