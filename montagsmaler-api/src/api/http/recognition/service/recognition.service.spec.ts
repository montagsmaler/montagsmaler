import { Test, TestingModule } from '@nestjs/testing';
import { RecognitionService } from './recognition.service';
import { rekognitionProviders } from './rekognition.provider'
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { DetectLabelsRequest } from 'aws-sdk/clients/rekognition';

const mockData = { Bucket: "dev4cloudmontagsmaler", Name:"test.jpg"};

const mockResponse = { Image: { S3Object: { Bucket: 'dev4cloudmontagsmaler', Name: 'test.jpg' } } };

describe('RecognitionService', () => {
	let service: RecognitionService;
	AWSMock.setSDKInstance(AWS);
	AWSMock.mock('Rekognition','detectLabels', (params: DetectLabelsRequest, callback: Function) => {
		callback(null, params);
	})
	
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [...rekognitionProviders,RecognitionService]
		})
		.overrideProvider('rekognition_provider')
		.useValue(new AWS.Rekognition())
		.compile();
		service = module.get<RecognitionService>(RecognitionService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should rekognize', async () => {
		let result = null;
		try{
			result = await service.recognize(mockData);
		}catch (err) {
		}
		expect(result).toEqual(mockResponse);
	})
});
