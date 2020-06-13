/* eslint-disable @typescript-eslint/camelcase */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { AuthModule } from '../src/api/http/auth/auth.module';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/api/http/auth/service/auth.service';
import { AuthCredentialsDto } from '../src/api/http/auth/models/auth-credentials.dto';
import { AuthRegisterDto } from '../src/api/http/auth/models/auth-register.dto';

describe('auth', () => {
	let app: INestApplication;
	
	const authService = { 
		login: async (userCredentials: AuthCredentialsDto) => {
			try {
				if (userCredentials.password === 'test2') {
					throw {code: 'NotAuthorizedException', name: 'NotAuthorizedException', message: 'Incorrect username or password.'};
				}
				return {
					jwtToken: "eyJrhWQiOiJDQmNNYTFLQmh2bkVsNGZTaTF0c1Vrd2V4Kyt0XC9SSkM5aE1oeVVhXC9PQmc9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI5NDE0ZWQ5Zi0xOTMyLTQxODctYTY0Yy1mMGMxODkxNzU2OGMiLCJldmVudF9pZCI6IjkzZmQ1NGU2LWY4ZDctNDcxMi1iZWFiLTM5NTJiYjA3NTkwNyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE1OTIwNTMzNTEsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX0xLbnlIOHh6SiIsImV4cCI6MTU5MjA1Njk1MSwiaWF0IjoxNTkyMDUzMzUxLCJqdGkiOiIwNWVlODNlYy0wODc5LTRlNTItOWYxNC00M2JlOGM2MDNhM2MiLCJjbGllbnRfaWQiOiJpbXJjZ3E0Z2VkcDI5aWRtdHZhcTk3bnN2IiwidXNlcm5hbWUiOiJsdWNhcyJ9.EGioS9amGjYoGXiU5It_WSiKwK7zdiZ_Tu8vZyZjkhpir4gACf7dlOmDiq4AUsBev5OYECq0_N4eJxc_okaZl1p0V2cXObqEmu8ypiYhCEHa-e_4DASdPBaGL4I0kEmD4wig0ZvkD1r8xb5p0mWmYG970upn8ijX17qgducaiToKOjAxOWA4a0QlZwfPpECwwKOsimJg_EVbstDLKcEqmjhD3zhJuB3AyiZpQLA0fVS_zTpec06SBkSlg8b8h2k4iAX2Qwqw37Z6xvUck2KfY4TOphMk1a_FC6ctKYnJa_Mkwbhe2_WXqJ2A08SuGJgCJONU64aXYUnQ9mT8U-g",
					payload: {
						sub: "9404ed9f-1932-4187-a64c-f2c18917568c",
						event_id: "92fd54e6-f8d7-4712-beab-3752bb075907",
						token_use: "access",
						scope: "aws.cognito.signin.user.admin",
						auth_time: 1592053351,
						iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LKqyH8yzJ",
						exp: 1592056951,
						iat: 1592053351,
						jti: "05ee83ec-0819-4e52-9f14-43be8c603a3c",
						client_id: "imacgq4gedp2tidmtvaq87nsv",
						username: "lucas"
					}
				}
			} catch (err) {
				console.log(err);
				throw err;
			}
    },
		register: async (userCredentials: AuthRegisterDto) => {
			return {userName: 'lucas'};
		},
		verifyRegister: async (userCredentials: AuthCredentialsDto) => {
			return 'SUCCESS';
		},
		verifyToken: async (token: string) => {
			return {userName: 'lucas'};
		},
	};

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(AuthService)
			.useValue(authService)
			.compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	it(`should /POST login successfully`, async () => {
		const credentials: AuthCredentialsDto = {name: 'lucas', password: 'test'};
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
			.send({name: 'lucas'})
			.set('Accept', 'application/json')
      .expect('Content-Type', /json/)
			.expect(HttpStatus.BAD_REQUEST)
			.expect({statusCode: HttpStatus.BAD_REQUEST, message: 'Validation failed', error: 'Bad Request'});
	});

	it(`should /POST login fail unauthorized`, async () => {
		const credentials: AuthCredentialsDto = {name: 'lucas', password: 'test2'};
		return request(app.getHttpServer())
			.post('/auth/login')
			.send(credentials)
			.set('Accept', 'application/json')
      .expect('Content-Type', /json/)
			.expect(HttpStatus.UNAUTHORIZED)
			.expect({code: 'NotAuthorizedException', name: 'NotAuthorizedException', message: 'Incorrect username or password.'});
	});

	afterAll(async () => {
		await app.close();
	});
});