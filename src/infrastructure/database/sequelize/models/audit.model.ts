import {
  AllowNull,
  Column,
  DataType,
  Default,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { IAudit } from 'src/domain/entities';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

@Table({
  tableName: 'audits',
  timestamps: true,
  paranoid: true,
})
export class Audit extends BaseModel implements IAudit {
  @Column({ field: 'entity_name', type: DataType.STRING(128) })
  declare entityName: string;

  @Column({ field: 'entity_id', type: DataType.STRING(64) })
  declare entityId: string;

  @Column({ type: DataType.STRING(16) })
  declare action: AuditAction;

  @AllowNull(true)
  @Column({ field: 'user_id', type: DataType.STRING(64) })
  declare userId: string;

  @AllowNull(true)
  @Column({ field: 'old_value', type: DataType.JSONB })
  declare oldValue: Record<string, unknown> | null;

  @AllowNull(true)
  @Column({ field: 'new_value', type: DataType.JSONB })
  declare newValue: Record<string, unknown> | null;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE })
  declare timestamp: Date;

  @AllowNull(true)
  @Column({ type: DataType.JSONB })
  declare metadata: Record<string, unknown> | null;
}
