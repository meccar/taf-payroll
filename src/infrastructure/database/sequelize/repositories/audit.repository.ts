import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Audit } from '../models';
import { Audit as AuditEntity } from 'src/domain/entities';
import { AuditAdapter } from 'src/domain/adapters';

@Injectable()
export class AuditRepository
  extends BaseRepository<Audit, AuditEntity>
  implements AuditAdapter
{
  constructor(private readonly logger = new Logger(AuditRepository.name)) {
    super(Audit, AuditEntity);
  }

  protected getEntityName(): string {
    return Audit.name;
  }

  async log(auditData: {
    entityName: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    userId?: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
  }): Promise<void> {
    try {
      const audit = Audit.build({
        entityName: auditData.entityName,
        entityId: auditData.entityId,
        action: auditData.action,
        userId: auditData.userId,
        oldValue: auditData.oldValue,
        newValue: auditData.newValue,
        timestamp: new Date(),
        metadata: auditData.metadata,
      });
      const auditModel = audit as unknown as AuditEntity;

      if (
        auditData.action === 'UPDATE' &&
        auditModel.getChangedFields().length === 0
      ) {
        this.logger.debug('No changes detected, skipping audit log');
        return;
      }

      if (auditModel.isSensitiveChange()) {
        this.logger.warn(
          `Sensitive data change detected for ${audit.entityName}:${audit.entityId}`,
        );
      }

      await audit.save();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to log audit: ${error.message}`, error.stack);
        return;
      }

      this.logger.error('Failed to log audit due to an unknown error');
    }
  }
}
