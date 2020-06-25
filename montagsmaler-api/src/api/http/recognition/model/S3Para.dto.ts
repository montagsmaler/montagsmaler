import { IsString, IsNotEmpty } from 'class-validator';
import { Rekognition } from 'aws-sdk';

export class S3Para {
	
	@IsString()
  @IsNotEmpty()
	Bucket: string;

	@IsString()
  @IsNotEmpty()
    Name: string;
}