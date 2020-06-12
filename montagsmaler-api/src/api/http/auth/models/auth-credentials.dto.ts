import { IsString, IsNotEmpty } from 'class-validator';

export class AuthCredentialsDto {
	
	@IsString()
  	@IsNotEmpty()
	name: string;

	@IsString()
  	@IsNotEmpty()
	password: string;
}