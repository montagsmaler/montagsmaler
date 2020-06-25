/* eslint-disable @typescript-eslint/camelcase */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { AuthModule } from '../../src/api/http/auth/auth.module';
import { AuthService } from '../../src/api/http/auth/service/auth.service';
import { AuthCredentialsDto } from '../../src/api/http/auth/models/auth-credentials.dto';
import { AuthRegisterDto } from '../../src/api/http/auth/models/auth-register.dto';
import { AuthVerifyRegisterDto } from '../../src/api/http/auth/models/auth-verify.dto';
import { ConfigService } from '@nestjs/config';
import { AuthServiceMock } from './auth.service.mock';

describe('auth', () => {
	let app: INestApplication;

	const authService = new AuthServiceMock();

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
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

		app = await moduleRef.createNestApplication().init();
	});

	it(`should /POST login successfully`, async () => {
		const credentials: AuthCredentialsDto = { name: 'lucas', password: 'test' };
		return request(app.getHttpServer())
			.post('/auth/login')
			.send(credentials)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.CREATED)
			.expect(await authService.login(credentials));
	});

	it(`should /POST login fail in validation pipe`, async () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({ name: 'lucas' })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.BAD_REQUEST)
			.expect({ statusCode: HttpStatus.BAD_REQUEST, message: 'Validation failed', error: 'Bad Request' });
	});

	it(`should /POST login fail unauthorized`, async () => {
		const credentials: AuthCredentialsDto = { name: 'lucas', password: 'test2' };
		return request(app.getHttpServer())
			.post('/auth/login')
			.send(credentials)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.UNAUTHORIZED)
			.expect({ statusCode: HttpStatus.UNAUTHORIZED, message: 'Incorrect username or password.', error: 'Unauthorized' });
	});

	it(`should /POST register successfully`, async () => {
		const register: AuthRegisterDto = { name: 'lucas', email: 'lc30@hdm-stutttgart.de', password: 'TestTestTest2!' };
		return request(app.getHttpServer())
			.post('/auth/register')
			.send(register)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.CREATED)
			.expect({ userName: register.name });
	});

	it(`should /POST register fail in validation pipe`, async () => {
		const register: AuthRegisterDto = { name: 'lucas', email: 'lc30@hdm-stutttgart.de', password: 'test2' };
		return request(app.getHttpServer())
			.post('/auth/register')
			.send(register)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.BAD_REQUEST)
			.expect({ statusCode: HttpStatus.BAD_REQUEST, message: 'Validation failed', error: 'Bad Request' });
	});

	it(`should /POST register fail username already exist`, async () => {
		const register: AuthRegisterDto = { name: 'lucas', email: 'lc30@hdm-stutttgart.de', password: 'TestTestTest2!' };
		return request(app.getHttpServer())
			.post('/auth/register')
			.send(register)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.BAD_REQUEST)
			.expect({ statusCode: HttpStatus.BAD_REQUEST, message: 'User already exists', error: 'Bad Request' });
	});

	it(`should /POST verifyRegister successfully`, async () => {
		const verify: AuthVerifyRegisterDto = { name: 'lucas', confirmationCode: '533556' };
		return request(app.getHttpServer())
			.post('/auth/verifyRegister')
			.send(verify)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.CREATED)
			.expect({ SUCCESS: true });
	});

	it(`should /POST verifyRegister fail in validation pipe`, async () => {
		const verify = { confirmationCode: '533556' };
		return request(app.getHttpServer())
			.post('/auth/verifyRegister')
			.send(verify)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.BAD_REQUEST)
			.expect({ statusCode: HttpStatus.BAD_REQUEST, message: 'Validation failed', error: 'Bad Request' });
	});

	it(`should /POST verifyRegister fail bad code`, async () => {
		const verify: AuthVerifyRegisterDto = { name: 'lucas', confirmationCode: '533557' };
		return request(app.getHttpServer())
			.post('/auth/verifyRegister')
			.send(verify)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(HttpStatus.BAD_REQUEST)
			.expect({ statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid verification code provided, please try again.', error: 'Bad Request' });
	});

	it(`should /GET cognitoUser successfully`, async () => {
		return request(app.getHttpServer())
			.get('/auth/cognitoUser')
			.set('Authorization', 'Bearer eyJraWQiOiJD')
			.expect(HttpStatus.OK)
			.expect({ userName: 'lucas' });
	});

	it(`should /GET cognitoUser fail`, async () => {
		return request(app.getHttpServer())
			.get('/auth/cognitoUser')
			.set('Authorization', 'Bearer ayJaaWQiOiJD')
			.expect(HttpStatus.UNAUTHORIZED)
			.expect({ statusCode: HttpStatus.UNAUTHORIZED, message: 'Token could not be verified!', error: 'Unauthorized' });
	});

	afterAll(async (done) => {
		await app.close();
		done();
	});
});