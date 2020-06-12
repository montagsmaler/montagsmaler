import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ClaimVerifyRequest, ClaimVerifyResult } from '../models/aws-token';

@Injectable()
export class AuthCognitoStrategy extends PassportStrategy(Strategy) {
  
	constructor(private readonly authService: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'secret',
		});
	}

  public async validate(
    payload: ClaimVerifyRequest,
    done: (err: Error | null, result: ClaimVerifyResult | null) => void,
  ) {
		if (!payload.token || (typeof payload.token !== 'string')) {
			return done(new UnauthorizedException(new Error('No Token sent!')), null);
		}
		try {
			done(null, await this.authService.verifyToken(payload.token));
		} catch (err) {
			done(new UnauthorizedException(err), null);
		}
  }
}