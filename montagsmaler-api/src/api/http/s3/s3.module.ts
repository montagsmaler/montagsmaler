import { Module } from '@nestjs/common';
import { S3Controller } from './controller/s3.controller';
import { S3Service } from './service/s3.service';
import { ConfigModule } from '@nestjs/config';
import { ValidationModule } from '../../../shared/validation/validation.module';
import { S3Provider } from './service/s3.provider';

@Module({
	imports: [ConfigModule, ValidationModule],
	controllers: [],
	providers: [...S3Provider,S3Service],
	exports: [S3Service],
})
export class S3Module {}