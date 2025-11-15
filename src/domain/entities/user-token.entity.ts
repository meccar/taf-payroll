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
  tableName: 'user_tokens',
  timestamps: true,
  paranoid: true,
})
export class UserToken extends BaseEntity {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(128), allowNull: false })
  declare loginProvider: string;

  @Column({ type: DataType.STRING(128), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare value?: string;

  @BelongsTo(() => User)
  declare user: User;
}
