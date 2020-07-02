import { Test, TestingModule } from '@nestjs/testing';
import { S3Controller } from './s3.controller';
import { ConfigService } from '@nestjs/config';
import { S3Module } from '../s3.module';

describe('S3 Controller', () => {
  let controller: S3Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [S3Module],
    })
    .overrideProvider(ConfigService)
    .useValue({})
    .overrideProvider('S3_provider')
    .useValue({})
    .compile();

    controller = module.get<S3Controller>(S3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
