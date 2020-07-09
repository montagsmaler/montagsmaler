import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3Provider } from './s3.provider';
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { S3PutObjectRequestDto } from '../model/S3PutObjectRequest.dto';
import { testUpload } from '../../../../../test/s3/test_upload';

describe('S3Service', () => {
  let service: S3Service;
	AWSMock.setSDKInstance(AWS);
	AWSMock.mock('S3','upload', (params: S3PutObjectRequestDto, callback: Function) => {
		callback(null, "uploaded");
	})

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...S3Provider,S3Service],
    })
    .overrideProvider('S3_provider')
    .useValue(new AWS.S3())
    .compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

	it('should upload', async () => {
		let result = null;
		try{
			result = await service.upload(testUpload);
		}catch (err) {
		}
		expect(result).toEqual("uploaded");
	})
});
