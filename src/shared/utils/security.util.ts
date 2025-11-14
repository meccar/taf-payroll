import { ulid } from 'ulid';
import * as crypto from 'crypto';

export function generateConcurrencyStamp(): string {
  return ulid();
}

export function generateSecurityStamp(): string {
  return ulid().slice(0, 32);
}

export function generateEmailConfirmationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
