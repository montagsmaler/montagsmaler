import { Controller, UseGuards, Post, Body, Get, InternalServerErrorException, UnauthorizedException, BadRequestException, UsePipes, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthCognitoGuard } from '../middleware/auth.guard';
import { AuthRegisterDto } from '../models/auth-register.dto';
import { AuthCredentialsDto } from '../models/auth-credentials.dto';
import { AuthVerifyRegisterDto } from '../models/auth-verify.dto';
import { VerifiedCognitoUser } from '../middleware/auth.cognito.user.decorator';
import { ClaimVerfiedCognitoUser } from '../models/aws-token';
import { ICognitoUser } from '../models/cognito-user';
import { AuthVerifyRegisterSuccess } from '../models/auth-verify.success';
import { ValidationPipe } from '../../../../shared/validation/validation.pipe';
import { ILoginResult } from '../models/login.result';
import { REFRESH_TOKEN, RefreshToken } from '../middleware/auth.refreshtoken.decorator';

@UsePipes(ValidationPipe)
@Controller('auth')
export class AuthController {

	constructor(private readonly authService: AuthService) { }

	@Post('login')
	async login(@Body() body: AuthCredentialsDto, @Res() res: any): Promise<void> {
		try {
			const userSession = await this.authService.login(body);
			res.cookie(REFRESH_TOKEN, userSession.getRefreshToken().getToken(), { httpOnly: true, SameSite: 'None', maxAge: 2600000 });
			res.status(HttpStatus.CREATED).json(this.authService.cognitoUserSessionToLoginResult(userSession));
		} catch (err) {
			throw new UnauthorizedException(err.message);
		}
	}

	@Post('refresh')
	async refresh(@RefreshToken() refreshToken: string): Promise<ILoginResult> {
		try {
			if (!refreshToken) throw new Error('No refreshtoken cookie.');
			const userSession = await this.authService.refreshTokens(refreshToken);
			return this.authService.cognitoUserSessionToLoginResult(userSession);
		} catch (err) {
			throw new UnauthorizedException(err.message);
		}
	}

	@UseGuards(AuthCognitoGuard)
	@Post('logout')
	async logout(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser, @Res() res: any): Promise<void> {
		try {
			//const result = await this.authService.logout(user.userName); skip this rn need to set access token to global signout ;/
			res.cookie(REFRESH_TOKEN, '', { httpOnly: true, SameSite: 'None', maxAge: 0 });
			res.status(HttpStatus.CREATED).json({ SUCCESS: true });
		} catch (err) {
			throw new BadRequestException(err.message);
		}
	}

	@Post('register')
	async register(@Body() body: AuthRegisterDto): Promise<ICognitoUser> {
		try {
			return await this.authService.register(body);
		} catch (err) {
			throw new BadRequestException(err.message);
		}
	}

	@Post('verifyRegister')
	async verify(@Body() body: AuthVerifyRegisterDto): Promise<AuthVerifyRegisterSuccess> {
		try {
			return await this.authService.verifyRegister(body);
		} catch (err) {
			throw new BadRequestException(err.message);
		}
	}


	@UseGuards(AuthCognitoGuard)
	@Get('cognitoUser')
	async getCognitoUser(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser): Promise<ICognitoUser> {
		try {
			return { id: user.id, userName: user.userName };
		} catch (err) {
			throw new InternalServerErrorException(err.message);
		}
	}
}
