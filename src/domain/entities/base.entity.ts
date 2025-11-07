import { ulid } from 'ulid';
import { DataTypes } from 'sequelize';
import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  UpdatedAt,
} from 'sequelize-typescript';

export abstract class BaseEntity extends Model {
  @PrimaryKey
  @Column({
    type: DataTypes.STRING(26),
    defaultValue: () => ulid(),
  })
  declare id: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', allowNull: true })
  declare deletedAt?: Date;

  @Column({ field: 'created_by', allowNull: true })
  declare createdBy?: string;

  @Column({ field: 'updated_by', allowNull: true })
  declare updatedBy?: string;
}
