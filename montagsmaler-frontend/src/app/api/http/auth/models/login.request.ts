export interface ILoginRequest {
  name: string;
  password: string;
}

export class LoginRequest implements ILoginRequest {
  name: string;
  password: string;

  constructor(obj?: ILoginRequest) {
    if (obj && typeof obj === 'object') {
      Object.assign(this, obj);
    }
  }
}
