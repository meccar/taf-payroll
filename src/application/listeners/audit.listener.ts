import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from '../services/audit.service';
import {
  EntityCreatedEvent,
  EntityDeletedEvent,
  EntityUpdatedEvent,
} from 'src/domain/events/entity.events';

@Injectable()
export class AuditListener {
  constructor(private readonly auditService: AuditService) {}

  @OnEvent('entity.created', { async: true })
  async handleEntityCreatedEvent(event: EntityCreatedEvent): Promise<void> {
    await this.auditService.log({
      entityName: event.entityName,
      entityId: event.entityId,
      action: 'CREATE',
      userId: event.userId,
      newValue: event.data,
      metadata: event.metadata,
    });
  }

  @OnEvent('entity.updated', { async: true })
  async handleEntityUpdatedEvent(event: EntityUpdatedEvent): Promise<void> {
    await this.auditService.log({
      entityName: event.entityName,
      entityId: event.entityId,
      action: 'UPDATE',
      userId: event.userId,
      oldValue: event.oldValue,
      newValue: event.newValue,
      metadata: event.metadata,
    });
  }

  @OnEvent('entity.deleted', { async: true })
  async handleEntityDeletedEvent(event: EntityDeletedEvent): Promise<void> {
    await this.auditService.log({
      entityName: event.entityName,
      entityId: event.entityId,
      action: 'DELETE',
      userId: event.userId,
      oldValue: event.oldValue,
      metadata: event.metadata,
    });
  }
}
