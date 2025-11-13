import { Inject, Injectable, Logger } from '@nestjs/common';
import { Audit } from 'src/domain/entities/audit.entity';
import {
  AUDIT_REPOSITORY_TOKEN,
  type IAuditRepository,
} from 'src/domain/repositories/audit.interface';
import { ulid } from 'ulid';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject(AUDIT_REPOSITORY_TOKEN)
    private readonly auditRepository: IAuditRepository,
  ) {}

  async log(auditData: {
    entityName: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    userId?: string;
    oldValue?: unknown;
    newValue?: unknown;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      const audit = Audit.build({
        id: ulid(),
        entityName: auditData.entityName,
        entityId: auditData.entityId,
        action: auditData.action,
        userId: auditData.userId,
        oldValue: auditData.oldValue,
        newValue: auditData.newValue,
        timestamp: new Date(),
        metadata: auditData.metadata,
      });

      if (audit.action === 'UPDATE' && audit.getChangedFields().length === 0) {
        this.logger.debug('No changes detected, skipping audit log');
        return;
      }

      if (audit.isSensitiveChange()) {
        this.logger.warn(
          `Sensitive data change detected for ${audit.entityName}:${audit.entityId}`,
        );
      }

      await this.auditRepository.save(audit);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to log audit: ${error.message}`, error.stack);
        return;
      }

      this.logger.error('Failed to log audit due to an unknown error');
    }
  }
}
