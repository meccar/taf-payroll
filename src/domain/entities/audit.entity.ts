import { BaseEntity, BaseEntitySchema } from './base.entity';
import { z } from 'zod';

const asPlainRecord = (value: unknown): Record<string, unknown> | null => {
  if (value !== null && typeof value === 'object' && !Array.isArray(value))
    return value as Record<string, unknown>;

  return null;
};

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export const AuditSchema = BaseEntitySchema.extend({
  entityName: z.string().max(128),
  entityId: z.string().max(64),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  userId: z.string().max(64).nullable(),
  oldValue: z.record(z.string(), z.unknown()).nullable(),
  newValue: z.record(z.string(), z.unknown()).nullable(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type IAudit = z.infer<typeof AuditSchema>;

export class Audit extends BaseEntity<IAudit> implements IAudit {
  declare entityName: string;
  declare entityId: string;
  declare action: AuditAction;
  declare userId: string;
  declare oldValue: Record<string, unknown> | null;
  declare newValue: Record<string, unknown> | null;
  declare timestamp: Date;
  declare metadata: Record<string, unknown> | null;

  constructor(data: Partial<IAudit>) {
    super(AuditSchema, data);
  }

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
