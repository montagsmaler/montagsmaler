import { IsString, IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';

export class AuthRegisterDto {
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
}