import { Transaction } from 'sequelize';

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface CreateResult<T> {
  entity: T;
  transaction: Transaction;
}

export interface UpdateResult<T> {
  entity: T;
  transaction: Transaction;
}

export interface DeleteResult {
  success: boolean;
  transaction: Transaction;
}
