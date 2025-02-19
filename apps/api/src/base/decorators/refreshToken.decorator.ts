import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const refreshTokenExtractor = (_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request?.user?.refreshToken || null;
};

export const RefreshToken = createParamDecorator(refreshTokenExtractor);
