import { Transaction } from 'sequelize';

export class EntityCreatedEvent {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
    public readonly data: any,
    public readonly userId?: string,
    public readonly metadata?: Record<string, any>,
    public readonly transaction?: Transaction,
  ) {}
}

export class EntityUpdatedEvent {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
    public readonly oldValue: any,
    public readonly newValue: any,
    public readonly userId?: string,
    public readonly metadata?: Record<string, any>,
    public readonly transaction?: Transaction,
  ) {}
}

export class EntityDeletedEvent {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
    public readonly oldValue: any,
    public readonly userId?: string,
    public readonly metadata?: Record<string, any>,
    public readonly transaction?: Transaction,
  ) {}
}
