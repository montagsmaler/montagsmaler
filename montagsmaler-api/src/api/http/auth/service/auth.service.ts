import { Injectable, Inject, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { CognitoUserPool, AuthenticationDetails, CognitoUser, CognitoUserSession, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { AuthCredentialsDto } from '../models/auth-credentials.dto';
import { AuthRegisterDto } from '../models/auth-register.dto';
import * as Axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import { PublicKeys, PublicKeyMeta, ClaimVerifyResult, Claim, TokenHeader } from '../models/aws-token';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnApplicationBootstrap {

  private publicKeys: Map<string, PublicKeyMeta>;
  private readonly logger = new Logger(this.constructor.name, true);
  private cognitoIssuerUrl: string;

	constructor(@Inject('aws_cognito_user_pool') private readonly cognitoUserPool: CognitoUserPool, private readonly configService: ConfigService) { }
  
  public async onApplicationBootstrap(): Promise<void> {
    try {
      this.cognitoIssuerUrl = `https://cognito-idp.${this.configService.get('AWS_REGION')}.amazonaws.com/${this.configService.get('USER_POOL_ID')}/.well-known/jwks.json`;
      await this.loadPublicKeys();
      this.logger.log(`Successfully loaded ${this.publicKeys.size} public keys.`);
    } catch (err) {
      this.logger.error('Failed to load cognito public keys.', err.stack);
    }
  }

	public login(userCredentials: AuthCredentialsDto): Promise<CognitoUserSession> {

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
          console.log('Login successful!');
          resolve(result);
        },
        onFailure: (err) => {
          console.log('Login fail!');
          reject(err);
        },
      });
    });
	}
	
	public register(authRegisterRequest: AuthRegisterDto): Promise<CognitoUser> {
    return new Promise(((resolve, reject) => {
      this.cognitoUserPool.signUp(authRegisterRequest.name, authRegisterRequest.password, [new CognitoUserAttribute({ Name: 'email', Value: authRegisterRequest.email })], null, (err, result) => {
        if (!result) {
          reject(err);
        } else {
          resolve(result.user);
        }
      });
    }));
  }

  public async verifyToken(token: string): Promise<ClaimVerifyResult> {
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
      return await new Promise<ClaimVerifyResult>((resolve, reject) => {
        jwt.verify(token, key.pem, {algorithms: ['RS256']}, (err: any, claim: Claim) => {
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
          resolve({userName: claim.username, clientId: claim.client_id});
        });
      });
    } catch (err) {
      throw new Error('Token could not be verified!');
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
        agg.set(current.kid, {instance: current, pem});
        return agg;
      }, new Map<string, PublicKeyMeta>());
    } catch (err) {
      throw err;
    }
  }
  
  private async fetchPubliyKeys(): Promise<PublicKeys> {
    try {
      return (await Axios.default.get<PublicKeys>(this.cognitoIssuerUrl)).data;
    } catch (err) {
      throw err;
    }
  }
}
