export class EntityCreatedEvent {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
    public readonly data: Record<string, unknown> | null,
    public readonly userId?: string,
    public readonly metadata?: Record<string, unknown> | null,
    public readonly transaction?: any,
  ) {}
}

export class EntityUpdatedEvent {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
    public readonly oldValue: Record<string, unknown> | null,
    public readonly newValue: Record<string, unknown> | null,
    public readonly userId?: string,
    public readonly metadata?: Record<string, unknown> | null,
    public readonly transaction?: any,
  ) {}
}

export class EntityDeletedEvent {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
    public readonly oldValue: Record<string, unknown> | null,
    public readonly userId?: string,
    public readonly metadata?: Record<string, unknown> | null,
    public readonly transaction?: any,
  ) {}
}
