import { Test, TestingModule } from '@nestjs/testing';
import { RecognitionService } from './recognition.service';

describe('RecognitionService', () => {
  let service: RecognitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecognitionService],
    }).compile();

    service = module.get<RecognitionService>(RecognitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
