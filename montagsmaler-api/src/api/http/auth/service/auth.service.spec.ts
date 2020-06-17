/* eslint-disable @typescript-eslint/camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { awsProvider } from './aws-cognito.provider';
import { PUBLIC_KEY, PRIVATE_KEY, UNFITTING_PRIVATE_KEY } from '../../../../../test/auth/test_keys';
import { PublicKeys, ClaimVerfiedCognitoUser } from '../models/aws-token';
import * as jwt from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { ICognitoUser } from '../models/cognito-user';
const spyOn = jest.spyOn;

const PRIVATE_PEM = jwkToPem(PRIVATE_KEY, { private: true });

const mockData = { issuer: '127.0.0.1', user: 'lucas', clientId: 'abc123' };

const getExpForDateStr = (dateStr: string): number => Math.floor(new Date(dateStr).getTime() / 1000);

const claimPayloadMockFactory = (username: string, client_id: string, exp: number, iss: string, token_use: string) => ({ username, client_id, exp, iss, token_use });

const signedTokenMockFactory = (username: string, client_id: string, exp: number, iss: string, token_use: string, kid: string = PRIVATE_KEY.kid, privateKeyPem: string = PRIVATE_PEM) => jwt.sign(claimPayloadMockFactory(username, client_id, exp, iss, token_use), privateKeyPem, { algorithm: 'RS256', noTimestamp: true, header: { kid } });

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

describe('AuthService', () => {
	let authService: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [...awsProvider, AuthService],
		})
			.overrideProvider('aws_cognito_user_pool')
			.useValue(new CognitoUserPool({ UserPoolId: 'us-east-1_LKayH2xzJ', ClientId: 'imrcgq4gidp29idmtval97nsv' }))
			.overrideProvider('aws_cognito_issuer_url')
			.useValue(mockData.issuer)
			.compile();

		authService = module.get<AuthService>(AuthService);

		spyOn(authService as any, 'fetchPublicKeys').mockImplementation(async (): Promise<PublicKeys> => ({ keys: [PUBLIC_KEY] }));

		await module.init();
	});

	it('should be defined', () => {
		expect(authService).toBeDefined();
	});

	it('should contain one key', () => {
		expect(authService['publicKeys'].size).toBe(1);
	});

	it('should be verified', async () => {
		const expectedResult: ClaimVerfiedCognitoUser = { userName: mockData.user, clientId: mockData.clientId };
		expect(
			await authService.verifyToken(
				signedTokenMockFactory(mockData.user, mockData.clientId, getExpForDateStr(tomorrow.toDateString()), mockData.issuer, 'access')
			)
		)
			.toEqual(expectedResult);
	});

	it('should fail to be verified (token exp expired)', async () => {
		expect.assertions(2);
		let verifiedClaim;
		try {
			verifiedClaim = await authService.verifyToken(
				signedTokenMockFactory(mockData.user, mockData.clientId, getExpForDateStr('2020-06-16T19:36:00'), mockData.issuer, 'access')
			);
		} catch (err) {
			expect(err).toEqual(new Error('jwt expired'));
		}
		expect(verifiedClaim).toBeFalsy();
	});

	it('should fail to be verified (token is refresh token)', async () => {
		expect.assertions(2);
		let verifiedClaim;
		try {
			verifiedClaim = await authService.verifyToken(
				signedTokenMockFactory(mockData.user, mockData.clientId, getExpForDateStr(tomorrow.toDateString()), mockData.issuer, 'refresh')
			);
		} catch (err) {
			expect(err).toEqual(new Error('Claim use is not access.'));
		}
		expect(verifiedClaim).toBeFalsy();
	});

	it('should fail to be verified (wrong claim issuer)', async () => {
		expect.assertions(2);
		let verifiedClaim;
		try {
			verifiedClaim = await authService.verifyToken(
				signedTokenMockFactory(mockData.user, mockData.clientId, getExpForDateStr(tomorrow.toDateString()), 'facebook.com', 'access')
			);
		} catch (err) {
			expect(err).toEqual(new Error('Claim issuer is invalid.'));
		}
		expect(verifiedClaim).toBeFalsy();
	});

	it('should fail to be verified (wrong kid)', async () => {
		expect.assertions(2);
		let verifiedClaim;
		try {
			verifiedClaim = await authService.verifyToken(
				signedTokenMockFactory(mockData.user, mockData.clientId, getExpForDateStr(tomorrow.toDateString()), mockData.issuer, 'access', '11111')
			);
		} catch (err) {
			expect(err).toEqual(new Error('Claim made for unknown kid.'));
		}
		expect(verifiedClaim).toBeFalsy();
	});

	it('should fail to be verified (was signed by another key)', async () => {
		expect.assertions(2);
		let verifiedClaim;
		try {
			verifiedClaim = await authService.verifyToken(
				signedTokenMockFactory(mockData.user, mockData.clientId, getExpForDateStr(tomorrow.toDateString()), mockData.issuer, 'access', UNFITTING_PRIVATE_KEY.kid, jwkToPem(UNFITTING_PRIVATE_KEY, { private: true }))
			);
		} catch (err) {
			expect(err).toEqual(new Error('invalid signature'));
		}
		expect(verifiedClaim).toBeFalsy();
	});

	it('should throw an error (user exists already)', async () => {
		expect.assertions(2);
		let user;
		spyOn(authService['cognitoUserPool'], 'signUp').mockImplementationOnce((a, b, c, d, cb) => cb(new Error('User already exists')));
		try {
			user = await authService.register({ name: 'lucas', email: 'lc30@hdm-stutttgart.de', password: 'TestTestTest2!' });
		} catch (err) {
			expect(err).toEqual(new Error('User already exists'));
		}
		expect(user).toBeFalsy();
	});

	it('should return user', async () => {
		expect.assertions(1);
		const user: ICognitoUser = { userName: 'lucas' };
		spyOn(authService['cognitoUserPool'], 'signUp').mockImplementationOnce((user, b, c, d, cb) => cb(null, { user: { getUsername: () => user } } as any));
		expect(
			await authService.register({ name: user.userName, email: 'lc30@hdm-stutttgart.de', password: 'TestTestTest2!' })
		)
			.toEqual(user);
	});

	it('should return access token', async () => {
		expect.assertions(1);
		const payload = "jqoiwjdw";
		spyOn(CognitoUser.prototype, 'authenticateUser').mockImplementationOnce((authenticationDetails, callbacks) => callbacks.onSuccess({ getAccessToken: () => ({ payload }) } as any));
		expect(
			await authService.login({ name: 'lucas', password: 'TestTestTest2!' })
		)
			.toEqual({ payload });
	});

	it('should throw an error (incorrect username or password)', async () => {
		expect.assertions(2);
		let token;
		spyOn(CognitoUser.prototype, 'authenticateUser').mockImplementationOnce((authenticationDetails, callbacks) => callbacks.onFailure(new Error('Incorrect username or password.')));
		try {
			token = await authService.login({ name: 'lucas', password: 'TestTestTest2!' });
		} catch (err) {
			expect(err).toEqual(new Error('Incorrect username or password.'));
		}
		expect(token).toBeFalsy();
	});

	it('should return register success', async () => {
		expect.assertions(1);
		spyOn(CognitoUser.prototype, 'confirmRegistration').mockImplementationOnce((code, b, cb) => cb(null, 'SUCCESS'));
		expect(
			await authService.verifyRegister({ name: 'lucas', confirmationCode: '12345' })
		)
			.toEqual({ SUCCESS: true });
	});

	it('should throw an error (register code wrong)', async () => {
		expect.assertions(2);
		let success;
		spyOn(CognitoUser.prototype, 'confirmRegistration').mockImplementationOnce((code, b, cb) => cb(new Error('Invalid verification code provided, please try again.')));
		try {
			success = await authService.verifyRegister({ name: 'lucas', confirmationCode: '12345' });
		} catch (err) {
			expect(err).toEqual(new Error('Invalid verification code provided, please try again.'));
		}
		expect(success).toBeFalsy();
	});

});
