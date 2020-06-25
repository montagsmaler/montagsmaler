import { Controller, UseGuards, Post, Body, Get, InternalServerErrorException, UnauthorizedException, BadRequestException, UsePipes } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthCognitoGuard } from '../middleware/auth.guard';
import { AuthRegisterDto } from '../models/auth-register.dto';
import { AuthCredentialsDto } from '../models/auth-credentials.dto';
import { AuthVerifyRegisterDto } from '../models/auth-verify.dto';
import { VerifiedCognitoUser } from '../middleware/auth.cognito.user.decorator';
import { ClaimVerfiedCognitoUser } from '../models/aws-token';
import { CognitoAccessToken } from 'amazon-cognito-identity-js';
import { ICognitoUser } from '../models/cognito-user';
import { AuthVerifyRegisterSuccess } from '../models/auth-verify.success';
import { ValidationPipe } from '../../../../shared/validation/validation.pipe';

@UsePipes(ValidationPipe)
@Controller('auth')
export class AuthController {

	constructor(private readonly authService: AuthService) { }

	@Post('login')
	async login(@Body() body: AuthCredentialsDto): Promise<CognitoAccessToken> {
		try {
			return await this.authService.login(body);
		} catch (err) {
			throw new UnauthorizedException(err.message);
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
			return {userName: user.userName};
		} catch (err) {
			throw new InternalServerErrorException(err.message);
		}
	}
}
