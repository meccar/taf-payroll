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
  tableName: 'user_tokens',
  timestamps: false,
})
export class UserToken extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare userId: string;

  @PrimaryKey
  @Column({ type: DataType.STRING(128), allowNull: false })
  declare loginProvider: string;

  @PrimaryKey
  @Column({ type: DataType.STRING(128), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare value?: string;

  @BelongsTo(() => User)
  declare user: User;
}
