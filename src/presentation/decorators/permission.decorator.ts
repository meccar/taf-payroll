import { CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GetUserClaimsUseCase } from 'src/application/usecases/role/get-user-claim.usecase';
import { User } from 'src/domain/entities/user.entity';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly getUserClaimsUseCase: GetUserClaimsUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (!user) return false;

    return this.getUserClaimsUseCase.hasAnyPermission(
      user.id,
      requiredPermissions,
    );
  }
}
