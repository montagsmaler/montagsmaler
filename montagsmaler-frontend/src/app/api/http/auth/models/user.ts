import { IIdToken } from './login.result';

export class User {

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
  ) { }

  public static fromIdToken(idToken: IIdToken): User {
    return new User(idToken.payload.sub, idToken.payload['cognito:username'], idToken.payload.email);
  }
}
