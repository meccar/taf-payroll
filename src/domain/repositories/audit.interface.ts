import type { InjectionToken } from '@nestjs/common';
import { Audit } from '../entities/audit.entity';

export const AUDIT_REPOSITORY_TOKEN: InjectionToken = Symbol(
  'AUDIT_REPOSITORY_TOKEN',
);

export interface IAuditRepository {
  save(auditLog: Audit): Promise<void>;
  findByEntity(entityName: string, entityId: string): Promise<Audit[]>;
  findByUser(userId: string): Promise<Audit[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Audit[]>;
}
