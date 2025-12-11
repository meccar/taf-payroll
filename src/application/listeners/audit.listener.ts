import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EntityCreatedEvent,
  EntityDeletedEvent,
  EntityUpdatedEvent,
} from 'src/domain/events/entity.events';
import { AuditAdapter } from 'src/domain/adapters';

@Injectable()
export class AuditListener {
  constructor(private readonly auditAdapter: AuditAdapter) {}

  @OnEvent('entity.created', { async: true })
  async handleEntityCreatedEvent(event: EntityCreatedEvent): Promise<void> {
    await this.auditAdapter.log({
      entityName: event.entityName,
      entityId: event.entityId,
      action: 'CREATE',
      userId: event.userId,
      oldValue: null,
      newValue: event.data,
      metadata: event.metadata ?? null,
    });
  }

  @OnEvent('entity.updated', { async: true })
  async handleEntityUpdatedEvent(event: EntityUpdatedEvent): Promise<void> {
    await this.auditAdapter.log({
      entityName: event.entityName,
      entityId: event.entityId,
      action: 'UPDATE',
      userId: event.userId,
      oldValue: event.oldValue ?? null,
      newValue: event.newValue ?? null,
      metadata: event.metadata ?? null,
    });
  }

  @OnEvent('entity.deleted', { async: true })
  async handleEntityDeletedEvent(event: EntityDeletedEvent): Promise<void> {
    await this.auditAdapter.log({
      entityName: event.entityName,
      entityId: event.entityId,
      action: 'DELETE',
      userId: event.userId,
      oldValue: event.oldValue,
      newValue: null,
      metadata: event.metadata ?? null,
    });
  }
}
