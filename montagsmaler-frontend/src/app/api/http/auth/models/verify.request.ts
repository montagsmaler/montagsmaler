export interface IVerifyRequest {
  name: string;
  confirmationCode: string;
}

export class VerifyRequest implements IVerifyRequest {
  name: string;
  confirmationCode: string;

  constructor(obj?: IVerifyRequest) {
    if (obj && typeof obj === 'object') {
      Object.assign(this, obj);
    }
  }
}
