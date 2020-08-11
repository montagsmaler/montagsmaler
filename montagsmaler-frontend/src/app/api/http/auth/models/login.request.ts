import { IsString, IsNotEmpty } from 'class-validator';
import { plainToClassAndValidate } from 'src/app/api/common';

export interface ILoginRequest {
  name: string;
  password: string;
}

export class LoginRequest implements ILoginRequest {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  public static fromObject(obj: ILoginRequest): Promise<LoginRequest> {
    return plainToClassAndValidate(LoginRequest, obj);
  }
}
