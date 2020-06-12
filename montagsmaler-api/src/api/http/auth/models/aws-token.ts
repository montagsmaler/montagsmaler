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

export interface ClaimVerifyRequest {
  readonly token?: string;
}

export interface ClaimVerifyResult {
  readonly userName: string;
  readonly clientId: string;
}

export interface Claim {
	sub?: string;
	aud?: string;
	email_verified?: boolean;
	token_use: string;
	auth_time: number;
	iss: string;
	username: string;
	exp: number;
	client_id: string;
	given_name?: string,
	iat?: number;
	email?: string;
}

export interface TokenHeader {
  kid: string;
  alg: string;
}