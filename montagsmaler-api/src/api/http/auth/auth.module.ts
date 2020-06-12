import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { awsProvider } from './service/aws-cognito.provider';
import { AuthCognitoStrategy } from './middleware/auth.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [PassportModule],
	controllers: [AuthController],
	providers: [...awsProvider, AuthService, AuthCognitoStrategy],
})
export class AuthModule {}
