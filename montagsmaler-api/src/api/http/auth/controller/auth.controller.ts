import { Controller, UseGuards, Post, Body, Get, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthCognitoGuard } from '../middleware/auth.guard';
import { AuthRegisterDto } from '../models/auth-register.dto';
import { AuthCredentialsDto } from '../models/auth-credentials.dto';
import { AuthVerifyRegisterDto } from '../models/auth-verify.dto';
import { VerifiedCognitoUser } from '../middleware/auth.cognito.user.decorator';
import { ClaimVerfiedCognitoUser } from '../models/aws-token';
import { CognitoAccessToken, CognitoUser } from 'amazon-cognito-identity-js';

@Controller('auth')
export class AuthController {

	constructor(private readonly authService: AuthService) { }

	@Post('login')
	async login(@Body() body: AuthCredentialsDto): Promise<CognitoAccessToken> {
		try {
			return await this.authService.login(body);
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}

	@Post('register')
	async register(@Body() body: AuthRegisterDto): Promise<CognitoUser> {
		try {
			return await this.authService.register(body);
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}

	@Post('verifyRegister')
	async verify(@Body() body: AuthVerifyRegisterDto): Promise<string> {
		try {
			return await this.authService.verifyRegister(body);
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}


	@UseGuards(AuthCognitoGuard)
	@Get('cognitoUser')
	async getCognitoUser(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser): Promise<ClaimVerfiedCognitoUser> {
		try {
			return user;
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}
}
