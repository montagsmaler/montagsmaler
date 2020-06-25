import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { RecognitionService } from '../service/recognition.service';
import { DetectLabelsRequest } from '../model/DetectLabelsRequest';
import { S3Para } from '../model/S3Para.dto';

@Controller('recognition')
export class RecognitionController {

    
    constructor(private readonly recogService: RecognitionService) { }
    
    @Post('recog')
	async login(@Body() body: S3Para): Promise<AWS.Rekognition.DetectLabelsResponse> {
		try {
			return await this.recogService.rekognition(body);
		} catch (err) {
			throw new BadRequestException(err.message);
		}
	}
}
