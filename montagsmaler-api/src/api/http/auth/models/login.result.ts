export interface ILoginResult {
  readonly idToken: IIdToken;
  readonly accessToken: IAccessToken;
}

export interface IIdToken {
  readonly jwtToken: string;
  readonly payload: {
    readonly sub: string;
    readonly aud: string;
    readonly event_id: string;
    readonly email_verified: boolean;
    readonly token_use: string;
    readonly auth_time: number;
    readonly iss: string;
    readonly exp: number;
    readonly iat: number;
    readonly email: string;
    readonly 'cognito:username': string;
  };
}

export interface IAccessToken {
  readonly jwtToken: string;
  readonly payload: {
    readonly sub: string;
    readonly event_id: string;
    readonly token_use: string;
    readonly scope: string;
    readonly auth_time: number;
    readonly iss: string;
    readonly exp: number;
    readonly iat: number;
    readonly jti: string;
    readonly client_id: string;
    readonly username: string;
  };
}
