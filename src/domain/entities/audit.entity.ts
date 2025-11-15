import {
  AllowNull,
  Column,
  DataType,
  Default,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './base.entity';

const asPlainRecord = (value: unknown): Record<string, unknown> | null => {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
};

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';

@Table({
  tableName: 'audits',
  timestamps: true,
  paranoid: true,
})
export class Audit extends BaseEntity {
  @Column({ field: 'entity_name', type: DataType.STRING(128) })
  declare entityName: string;

  @Column({ field: 'entity_id', type: DataType.STRING(64) })
  declare entityId: string;

  @Column({ type: DataType.STRING(16) })
  declare action: AuditAction;

  @AllowNull(true)
  @Column({ field: 'user_id', type: DataType.STRING(64) })
  declare userId?: string;

  @AllowNull(true)
  @Column({ field: 'old_value', type: DataType.JSONB })
  declare oldValue?: unknown;

  @AllowNull(true)
  @Column({ field: 'new_value', type: DataType.JSONB })
  declare newValue?: unknown;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE })
  declare timestamp: Date;

  @AllowNull(true)
  @Column({ type: DataType.JSONB })
  declare metadata?: Record<string, unknown>;

  hasChanged(fieldName: string): boolean {
    const oldRecord = asPlainRecord(this.oldValue);
    const newRecord = asPlainRecord(this.newValue);
    if (!oldRecord || !newRecord) {
      return true;
    }

    return oldRecord[fieldName] !== newRecord[fieldName];
  }

  getChangedFields(): string[] {
    const oldRecord = asPlainRecord(this.oldValue);
    const newRecord = asPlainRecord(this.newValue);
    if (!oldRecord || !newRecord) {
      return [];
    }

    return Object.keys(newRecord).filter(
      (key) => oldRecord[key] !== newRecord[key],
    );
  }

  isSensitiveChange(): boolean {
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'apiKey'];
    return this.getChangedFields().some((field) =>
      sensitiveFields.includes(field),
    );
  }
}
