import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../../application/auth';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

type CurrentUserProperty = keyof AuthenticatedUser;

export const CurrentUser = createParamDecorator<
  CurrentUserProperty | undefined
>((property, context) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user;

  if (!user) return undefined;

  if (!property) return user;

  return user[property];
});
