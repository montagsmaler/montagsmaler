import { Controller, UseGuards, Post, Request, Body, Get, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../service/auth.service';
import { AuthCognitoStrategy } from '../middleware/auth.strategy';

@Controller('auth')
export class AuthController {

	constructor(private readonly authService: AuthService) { }
	
  @Post('login')
  async login(@Request() req: any, @Body() body: any) {
		try {
			return await this.authService.login(body);
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}

  @Post('register')
  async register(@Request() req: any, @Body() body: any) {
		try {
			return await this.authService.register(body);
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
