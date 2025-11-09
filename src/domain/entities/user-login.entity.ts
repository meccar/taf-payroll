import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Model,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  tableName: 'user_logins',
  timestamps: false,
})
export class UserLogin extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(128) })
  declare loginProvider: string;

  @PrimaryKey
  @Column({ type: DataType.STRING(128) })
  declare providerKey: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare providerDisplayName?: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}
