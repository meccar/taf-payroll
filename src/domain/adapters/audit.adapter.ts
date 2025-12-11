import { Audit } from '../entities';
import { BaseAdapter } from './base.adapter';

export abstract class AuditAdapter extends BaseAdapter<Audit> {
  abstract log(auditData: {
    entityName: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    userId?: string;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
  }): Promise<void>;
}
