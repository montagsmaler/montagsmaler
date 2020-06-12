import { Controller, UseGuards, Post, Request, Body, Get, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthCognitoStrategy } from '../middleware/auth.strategy';
import { AuthRegisterDto } from '../models/auth-register.dto';
import { AuthCredentialsDto } from '../models/auth-credentials.dto';

@Controller('auth')
export class AuthController {

	constructor(private readonly authService: AuthService) { }
	
  @Post('login')
  async login(@Request() req: any, @Body() body: AuthCredentialsDto) {
		try {
			return await this.authService.login(body);
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}

  @Post('register')
  async register(@Request() req: any, @Body() body: AuthRegisterDto) {
		try {
			const cognitoUser = await this.authService.register(body);
			return cognitoUser;
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}
	
	@UseGuards(AuthCognitoStrategy)
  @Get('test')
  async test(@Request() req: any) {
		try {
			console.log(req);
			return req.user;
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
  }
}
