import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { awsProvider } from './service/aws-cognito.provider';
import { AuthCognitoGuard } from './middleware/auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [ConfigModule],
	controllers: [AuthController],
	providers: [...awsProvider, AuthService, AuthCognitoGuard],
})
export class AuthModule {}
