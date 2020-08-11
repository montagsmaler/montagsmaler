import { IsString, IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';
import { plainToClassAndValidate } from 'src/app/api/common';

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export class RegisterRequest implements IRegisterRequest {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  @Matches(/[a-z]/)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  @Matches(/[$-/:-?{-~!"^_`\[\]]/)
  password: string;

  public static fromObject(obj: IRegisterRequest): Promise<RegisterRequest> {
    return plainToClassAndValidate(RegisterRequest, obj);
  }
}
