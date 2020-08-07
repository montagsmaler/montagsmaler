import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const REFRESH_TOKEN = 'refreshToken';

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies[REFRESH_TOKEN];
  },
);
