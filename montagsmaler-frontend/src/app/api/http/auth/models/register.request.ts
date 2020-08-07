export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export class RegisterRequest implements IRegisterRequest {
  name: string;
  email: string;
  password: string;

  constructor(obj?: IRegisterRequest) {
    if (obj && typeof obj === 'object') {
      Object.assign(this, obj);
    }
  }
}
