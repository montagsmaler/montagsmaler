import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import 'cross-fetch/polyfill';
import { CognitoUserPool, AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoAccessToken } from 'amazon-cognito-identity-js';
import { AuthCredentialsDto } from '../models/auth-credentials.dto';
import { AuthRegisterDto } from '../models/auth-register.dto';
import * as Axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import { PublicKeys, PublicKeyMeta, ClaimVerfiedCognitoUser, Claim, TokenHeader } from '../models/aws-token';
import { AuthVerifyRegisterDto } from '../models/auth-verify.dto';
import { ICognitoUser } from '../models/cognito-user';
import { AuthVerifyRegisterSuccess } from '../models/auth-verify.success';

@Injectable()
export class AuthService implements OnModuleInit {

	private publicKeys: Map<string, PublicKeyMeta> = new Map<string, PublicKeyMeta>();
	private readonly logger = new Logger(this.constructor.name, true);
	private readonly cognitoIssuerKeysUrl: string = this.cognitoIssuerUrl + '/.well-known/jwks.json';

	constructor(
		@Inject('aws_cognito_user_pool') private readonly cognitoUserPool: CognitoUserPool,
		@Inject('aws_cognito_issuer_url') private readonly cognitoIssuerUrl: string,
	) { }

	public async onModuleInit(): Promise<void> {
		try {
			await this.loadPublicKeys();
			this.logger.log(`Successfully loaded ${this.publicKeys.size} public keys.`);
		} catch (err) {
			this.logger.error('Failed to load cognito public keys.', err.stack);
		}
	}

	public login(userCredentials: AuthCredentialsDto): Promise<CognitoAccessToken> {

		const authenticationDetails = new AuthenticationDetails({
			Username: userCredentials.name,
			Password: userCredentials.password,
		});

		const userData = {
			Username: userCredentials.name,
			Pool: this.cognitoUserPool,
		};

		const user = new CognitoUser(userData);

		return new Promise((resolve, reject) => {
			user.authenticateUser(authenticationDetails, {
				onSuccess: (result) => {
					resolve(result.getAccessToken());
				},
				onFailure: (err) => {
					reject(err);
				},
			});
		});
	}

	public register(authRegisterRequest: AuthRegisterDto): Promise<ICognitoUser> {
		return new Promise(((resolve, reject) => {
			this.cognitoUserPool.signUp(authRegisterRequest.name, authRegisterRequest.password, [new CognitoUserAttribute({ Name: 'email', Value: authRegisterRequest.email })], null, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve({userName: result.user.getUsername()});
				}
			});
		}));
	}

	public verifyRegister(verifyRegisterRequest: AuthVerifyRegisterDto): Promise<AuthVerifyRegisterSuccess> {
		const userData = {
			Username: verifyRegisterRequest.name,
			Pool: this.cognitoUserPool,
		};

		const user: CognitoUser = new CognitoUser(userData);

		return new Promise((resolve, reject) => {
			user.confirmRegistration(verifyRegisterRequest.confirmationCode, true, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve({SUCCESS: true});
				}
			});
		});
	}

	public async verifyToken(token: string): Promise<ClaimVerfiedCognitoUser> {
		try {
			const tokenSections = (token || '').split('.');
			if (tokenSections.length < 2) {
				throw new Error('Requested token is invalid.');
			}
			const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
			const header = JSON.parse(headerJSON) as TokenHeader;
			const key = this.publicKeys.get(header.kid);
			if (!key) {
				throw new Error('Claim made for unknown kid.');
			}
			return await new Promise<ClaimVerfiedCognitoUser>((resolve, reject) => {
				jwt.verify(token, key.pem, { algorithms: ['RS256'] }, (err: any, claim: Claim) => {
					if (err) {
						reject(err);
					}
					const currentSeconds = Math.floor(new Date().getTime() / 1000);
					if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
						reject(new Error('Claim is expired or invalid.'));
					}
					if (claim.iss !== this.cognitoIssuerUrl) {
						reject(new Error('Claim issuer is invalid.'));
					}
					if (claim.token_use !== 'access') {
						reject(new Error('Claim use is not access.'));
					}
					resolve({ userName: claim.username, clientId: claim.client_id });
				});
			});
		} catch (err) {
			throw new Error(err.message || 'Token could not be verified!');
		}
	}

	private async loadPublicKeys(): Promise<void> {
		try {
			const publicKeys = await this.fetchPubliyKeys();

			if (!publicKeys.keys || publicKeys.keys.length <= 0) {
				throw new Error('No public cognito keys could be fetched.');
			}

			this.publicKeys = publicKeys.keys.reduce((agg, current) => {
				const pem = jwkToPem(current);
				agg.set(current.kid, { instance: current, pem });
				return agg;
			}, new Map<string, PublicKeyMeta>());
		} catch (err) {
			throw err;
		}
	}

	private async fetchPubliyKeys(): Promise<PublicKeys> {
		try {
			return (await Axios.default.get<PublicKeys>(this.cognitoIssuerKeysUrl)).data;
		} catch (err) {
			throw err;
		}
	}
}