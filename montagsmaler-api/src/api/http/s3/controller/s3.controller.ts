import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { S3Service } from '../service/s3.service';
import { S3PutObjectRequestDto } from '../model/S3PutObjectRequest.dto';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload'

@Controller('s3')
export class S3Controller {
    
    constructor(private readonly S3Service: S3Service) {}
  
    @Post('upload')
    async create(@Body() body: S3PutObjectRequestDto): Promise<ManagedUpload.SendData> {
		try {
			return await this.S3Service.upload(body);
		} catch (err) {
			throw new BadRequestException(err.message);
		}
	}
}
