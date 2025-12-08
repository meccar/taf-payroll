import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from './base.model';

@Table({
  tableName: 'profiles',
  timestamps: true,
  paranoid: true,
})
export class Profile extends BaseModel {
  @Column({ type: DataType.STRING(), allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING() })
  declare firstName: string;

  @Column({ type: DataType.STRING() })
  declare lastName: string;

  @Column({ type: DataType.STRING() })
  declare phoneNumber: string;

  @Column({ type: DataType.STRING() })
  declare address: string;

  @Column({ type: DataType.STRING() })
  declare city: string;

  @Column({ type: DataType.STRING() })
  declare state: string;

  @Column({ type: DataType.STRING() })
  declare zipCode: string;

  @Column({ type: DataType.STRING() })
  declare country: string;
}
