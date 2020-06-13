import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClaimVerfiedCognitoUser } from '../models/aws-token';

export const VerifiedCognitoUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ClaimVerfiedCognitoUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.cognitoUser;
  },
);
