import { Injectable, UnauthorizedException, CanActivate, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ClaimVerfiedCognitoUser } from '../models/aws-token';

@Injectable()
export class AuthCognitoGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		let headers: Record<string, any> = {};

		if (request.headers) {
			headers = request.headers;
		} else if (request.handshake && request.handshake.headers) {
			headers = request.handshake.headers;
		}

    try {
      if (!headers.authorization) {
        throw new UnauthorizedException('No authheader sent.');
      }

			const token = this.extractBearerToken(headers.authorization);
      if (!token) {
        throw new UnauthorizedException('No bearertoken sent.');
      }

      try {
        const verifyResult: ClaimVerfiedCognitoUser = await this.authService.verifyToken(token);
        request.cognitoUser = verifyResult;
        return true;
      } catch (err) {
        throw new UnauthorizedException(err.message || 'Token could not be verified.');
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      } else {
        throw new InternalServerErrorException('Error while validating token.');
      }
    }
  }

  private extractBearerToken(authHeader: string): string | undefined {
    let token: string;
    const authHeaderArr = authHeader.split(' ');
    if (
      Array.isArray(authHeaderArr) &&
      authHeaderArr[0] === 'Bearer' &&
      authHeaderArr[1]
    ) {
      token = authHeaderArr[1];
    }
    return token;
  }
}
