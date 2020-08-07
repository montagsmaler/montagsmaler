/* eslint-disable @typescript-eslint/camelcase */
import { AuthCredentialsDto } from '../../src/api/http/auth/models/auth-credentials.dto';
import { AuthRegisterDto } from '../../src/api/http/auth/models/auth-register.dto';
import { AuthVerifyRegisterDto } from '../../src/api/http/auth/models/auth-verify.dto';
import { ILoginResult } from '../../src/api/http/auth/models/login.result';
import { CognitoUserSession, ICognitoUserSessionData, CognitoIdToken } from 'amazon-cognito-identity-js';

export class AuthServiceMock {
  private registeredUsers = new Array<AuthRegisterDto>();

  async login(userCredentials: AuthCredentialsDto) {
    if (userCredentials.password === 'test2') {
      throw {
        code: 'NotAuthorizedException',
        name: 'NotAuthorizedException',
        message: 'Incorrect username or password.',
      };
	}
	const token = 'xyz';
	const refreshToken = {
		"token": token,
		getToken: () => token,
	};
    const userSession = {
			"idToken": {
					"jwtToken": "xyz",
					"payload": {
							"sub": "013a8838-a7a2-4368-9f75-cfaab4c9c0ce",
							"aud": "imrcgq4gedp30idmtvaq97nsv",
							"email_verified": true,
							"event_id": "3791194c-e18e-4f2e-8db7-422fd93f800a",
							"token_use": "id",
							"auth_time": 1596802034,
							"iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_lKnyH9xAj",
							"cognito:username": "luka",
							"exp": 1596805634,
							"iat": 1596802034,
							"email": "lc@test.de"
					}
			},
			"refreshToken": refreshToken,
			getRefreshToken: () => refreshToken,
			"accessToken": {
					"jwtToken": "xyz",
					"payload": {
							"sub": "013a8838-a7a2-4368-9f75-cfaab4c9c0ce",
							"event_id": "3092094c-e18e-4f2e-8db7-422fd93f800a",
							"token_use": "access",
							"scope": "aws.cognito.signin.user.admin",
							"auth_time": 1596802034,
							"iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_lKnyH9xAj",
							"exp": 1596805634,
							"iat": 1596802034,
							"jti": "c94fe5a8-820c-44d5-9641-705dcd3091c3",
							"client_id": "imacgq3gedp29idmtvaq97nsv",
							"username": "lucas"
					}
			},
			"clockDrift": -1
		};
		return userSession;
	}
	
	cognitoUserSessionToLoginResult(cognitoUserSession): ILoginResult {
		const idToken = cognitoUserSession.idToken;
		const accessToken = cognitoUserSession.accessToken;
		return { idToken: { jwtToken: idToken.jwtToken, payload: idToken.payload as any }, accessToken: { jwtToken: accessToken.jwtToken, payload: accessToken.payload as any } };
	}


  async register(userCredentials: AuthRegisterDto) {
    if (this.registeredUsers.find(user => user.name === userCredentials.name)) {
      throw {
        code: 'UsernameExistsException',
        name: 'UsernameExistsException',
        message: 'User already exists',
      };
    } else {
      this.registeredUsers.push(userCredentials);
    }

    return { userName: 'lucas' };
  }

  async verifyRegister(userVerify: AuthVerifyRegisterDto) {
    if (userVerify.confirmationCode === '533556') {
      return { SUCCESS: true };
    } else {
      throw {
        code: 'CodeMismatchException',
        name: 'CodeMismatchException',
        message: 'Invalid verification code provided, please try again.',
      };
    }
  }

  async verifyToken(token: string) {
    if (token === 'eyJraWQiOiJD') {
      return { userName: 'lucas' };
    } else {
      throw new Error('Token could not be verified!');
    }
  }
}
