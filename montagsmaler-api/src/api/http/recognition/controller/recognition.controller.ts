import { Controller, BadRequestException, Get, UsePipes } from '@nestjs/common';
import { RecognitionService } from '../service/recognition.service';
import { S3ParameterDto } from '../model/S3Para.dto';
import { DetectLabelsResponse } from 'aws-sdk/clients/rekognition';
import { ValidationPipe } from '../../../../shared/validation/validation.pipe';
import { S3Parameter } from './s3parameter.decorator';

@UsePipes(ValidationPipe)
@Controller('recognition')
export class RecognitionController {

	constructor(private readonly recogService: RecognitionService) { }

	@Get('recognize')
	async recognize(@S3Parameter() s3Parameter: S3ParameterDto): Promise<DetectLabelsResponse> {
		try {
			return await this.recogService.recognize(s3Parameter);
		} catch (err) {
			throw new BadRequestException(err.message);
		}
	}
}
