import { ulid } from 'ulid';
import { DataTypes } from 'sequelize';
import { Column, Model, PrimaryKey } from 'sequelize-typescript';
import { IBaseEntity } from 'src/domain/entities';

export abstract class BaseModel extends Model implements IBaseEntity {
  @PrimaryKey
  @Column({
    type: DataTypes.STRING(26),
    defaultValue: () => ulid(),
  })
  declare id: string;

  @Column({ field: 'created_by', allowNull: true })
  declare createdBy: string;

  @Column({ field: 'updated_by', allowNull: true })
  declare updatedBy: string;
}
