import { Test, TestingModule } from '@nestjs/testing';
import * as RedisMock from 'ioredis-mock';
import { LockService } from './lock.service';

describe('LockService', () => {
	let service: LockService;
	const redisKeyValueMock = new RedisMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				{ provide: 'redis_keyvalue', useValue: redisKeyValueMock },
				LockService
			],
    }).compile();
		
		await module.init();

    service = module.get<LockService>(LockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
