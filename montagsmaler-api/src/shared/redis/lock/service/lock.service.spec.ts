import { Test, TestingModule } from '@nestjs/testing';
import * as RedisMock from 'ioredis-mock';
import { LockService } from './lock.service';
import { RedisClient } from '../../redisconfig/redis-client.enum';
import { KeyValueModule } from '../../keyvalue/keyvalue.module';
import { RedisconfigModule } from '../../redisconfig/redisconfig.module';
import { KeyValueService } from '../../keyvalue/service/keyvalue.service';

const testKey = 'test_key';
const incrementRessource = async (key: string, lockService: LockService, keyValueService: KeyValueService) => {
	const lock = await lockService.lockRessource(key);
	let value = await keyValueService.get<number>(key);
	value += 1;
	await keyValueService.set(testKey, value);
	await lock.unlock();
}

describe('LockService', () => {
	let lockService: LockService;
	let keyValService: KeyValueService;

	beforeEach(async () => {
		const redisKeyValueMock = new RedisMock();
		const redisSubMock = new RedisMock();
		const redisPubMock = redisSubMock.createConnectedClient();

		const module: TestingModule = await Test.createTestingModule({
			imports: [RedisconfigModule, KeyValueModule],
			providers: [
				LockService,
			],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.compile();

		await module.init();

		lockService = module.get<LockService>(LockService);
		keyValService = module.get<KeyValueService>(KeyValueService);

		await keyValService.set(testKey, 0);
	});

	it('should be defined', () => {
		expect(lockService).toBeDefined();
		expect(keyValService).toBeDefined();
	});

	it('should increment ressource', async (done) => {
			expect(await keyValService.get(testKey)).toEqual(0);
			await incrementRessource(testKey, lockService, keyValService);
			expect(await keyValService.get(testKey)).toEqual(1);
			done();
	});


	it('should throw error since ressource is already locked', async (done) => {
		try {
			const openLock = await lockService.lockRessource(testKey, 10000);
			expect(await keyValService.get(testKey)).toEqual(0);
			await incrementRessource(testKey, lockService, keyValService);
			expect(await keyValService.get(testKey)).toEqual(1);
		} catch (err) {
			expect(err.message).toEqual('Could not acquire lock.');
			done();
		}
	});

	it('should increment since ressource is unlocked', async (done) => {
		const lock = await lockService.lockRessource(testKey, 10000);
		await lock.unlock();
		expect(await keyValService.get(testKey)).toEqual(0);
		await incrementRessource(testKey, lockService, keyValService);
		expect(await keyValService.get(testKey)).toEqual(1);
		done();
	});
});
