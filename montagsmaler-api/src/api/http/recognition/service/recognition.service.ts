import { Injectable, Inject } from '@nestjs/common';
import { Rekognition } from 'aws-sdk';
import { DetectLabelsResponse } from 'aws-sdk/clients/rekognition';
import { S3ParameterDto } from '../model/S3Para.dto';

@Injectable()
export class RecognitionService {

	constructor(
		@Inject('rekognition_provider') private readonly rekognition: Rekognition,
	) { }

	public recognize(s3Params: S3ParameterDto): Promise<DetectLabelsResponse> {
		return new Promise((resolve, reject) => {
			this.rekognition.detectLabels({ Image: { S3Object: s3Params } }, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			})
		});
	}
}
