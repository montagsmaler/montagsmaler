import { ICognitoUser } from "./cognito-user";

export interface PublicKey {
	alg: string;
	e: string;
	kid: string;
	kty: string;
	n: string;
	use: string;
}

export interface PublicKeys {
	keys: PublicKey[];
}

export interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

export interface ClaimVerfiedCognitoUser {
	readonly id: string;
  readonly userName: string;
	readonly clientId: string;
}

export interface Claim {
	sub: string;
	event_id: string;
	token_use: string;
	scope: string;
	auth_time: number;
	iss: string;
	username: string;
	exp: number;
	client_id: string;
	given_name?: string,
	iat: number;
	email?: string;
}

export interface TokenHeader {
  kid: string;
  alg: string;
}