import { ulid } from 'ulid';

export function generateConcurrencyStamp(): string {
  return ulid();
}

export function generateSecurityStamp(): string {
  return ulid().slice(0, 32);
}
