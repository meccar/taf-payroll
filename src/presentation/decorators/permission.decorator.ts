import { Reflector } from '@nestjs/core';

export class PermissionGuard {
  constructor(private readonly reflector: Reflector) {}
}
