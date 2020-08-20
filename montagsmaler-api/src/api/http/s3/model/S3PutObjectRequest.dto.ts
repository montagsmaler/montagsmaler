import { IsString, IsNotEmpty } from 'class-validator';

export class S3PutObjectRequestDto {

	@IsString()
	@IsNotEmpty()
	Bucket: string;

	@IsString()
	@IsNotEmpty()
	Key: string;

	@IsString()
	@IsNotEmpty()
	Body: any;

	@IsString()
	@IsNotEmpty()
	ContentEncoding: string;

	@IsString()
	@IsNotEmpty()
	ContentType: string;

	
	@IsString()
	@IsNotEmpty()
	ACL: string;
}