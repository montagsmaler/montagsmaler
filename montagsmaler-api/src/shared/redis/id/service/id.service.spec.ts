import { Test, TestingModule } from '@nestjs/testing';
import { IdService } from './id.service';
import { KeyValueModule } from '../../keyvalue/keyvalue.module';
import * as RedisMock from 'ioredis-mock'
import { RedisClient } from '../..';

describe('IdService', () => {
	let service: IdService;
	const redisKeyValueMock = new RedisMock();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [KeyValueModule],
			providers: [IdService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.compile();

		await module.init();

		service = module.get<IdService>(IdService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should return uuidv4', () => {
		expect(service.getUUID()).toBeDefined();
		expect(typeof service.getUUID()).toEqual('string');
		expect(service.getUUID().length).toEqual(36);
	});

	it('should increment id', async () => {
		const startId = await service.getIncrementalID();
		expect(startId).toBeDefined();
		expect(startId).toEqual(1);
		expect(await service.getIncrementalID()).toBeGreaterThan(1);
	});
});
