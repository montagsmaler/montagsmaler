import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3Provider } from './s3.provider';

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...S3Provider,S3Service],
    })
    .overrideProvider('S3_provider')
    .useValue({
      accessKeyId: '',
      secretAccessKey: '',
      sessionToken: '',
    })
    .compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
