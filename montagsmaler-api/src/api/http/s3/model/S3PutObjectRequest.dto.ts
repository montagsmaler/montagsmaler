import { IsString, IsNotEmpty, isNotEmpty } from 'class-validator';

export class S3PutObjectRequestDto {

	@IsString()
	@IsNotEmpty()
	Bucket: string;

	@IsString()
	@IsNotEmpty()
    Key: string;
    
    @IsNotEmpty()
    Body: any;
}