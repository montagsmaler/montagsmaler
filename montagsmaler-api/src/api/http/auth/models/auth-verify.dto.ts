import { IsString, IsNotEmpty } from 'class-validator';

export class AuthVerifyRegisterDto {
	
	@IsString()
  @IsNotEmpty()
	name: string;

	@IsString()
  @IsNotEmpty()
	confirmationCode: string;
}