import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModule } from '../auth.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { AuthServiceMock } from '../../../../../test/auth/auth.service.mock';

describe('Auth Controller', () => {
	let controller: AuthController;
	let authService: AuthServiceMock;

	beforeEach(async () => {
		authService = new AuthServiceMock();

		const module = await Test.createTestingModule({
			imports: [AuthModule],
		})
			.overrideProvider(ConfigService)
			.useValue({})
			.overrideProvider('aws_cognito_user_pool')
			.useValue({})
			.overrideProvider('aws_cognito_issuer_url')
			.useValue('127.0.0.1')
			.overrideProvider(AuthService)
			.useValue(authService)
			.compile();

		controller = module.get<AuthController>(AuthController);

		await module.init();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
