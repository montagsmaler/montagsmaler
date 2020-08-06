import { IsString, IsNotEmpty } from 'class-validator';

export class S3ParameterDto {

	@IsString()
	@IsNotEmpty()
	Bucket: string;

	@IsString()
	@IsNotEmpty()
	Name: string;
}