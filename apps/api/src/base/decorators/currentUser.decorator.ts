import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const userExtractor = (_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request.user;
};

export const CurrentUser = createParamDecorator(userExtractor);
