import { IsString, IsNotEmpty } from 'class-validator';
import { plainToClassAndValidate } from 'src/app/api/common';

export interface IVerifyRequest {
  name: string;
  confirmationCode: string;
}

export class VerifyRequest implements IVerifyRequest {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  confirmationCode: string;

  public static fromObject(obj: IVerifyRequest): Promise<VerifyRequest> {
    return plainToClassAndValidate(VerifyRequest, obj);
  }
}
