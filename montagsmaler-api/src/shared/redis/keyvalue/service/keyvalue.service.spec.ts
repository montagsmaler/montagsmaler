import { Test, TestingModule } from '@nestjs/testing';
import { KeyValueService } from './keyvalue.service';
import { Cat } from '../../../../../test/shared/cat.model';
import * as RedisMock from 'ioredis-mock';
const spyOn = jest.spyOn;

describe('KeyvalueService', () => {
	let service: KeyValueService;
	const redisKeyValueMock = new RedisMock();
	const testValue = new Cat('Thomas', 8, 'black');

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [{ provide: 'redis_keyvalue', useValue: redisKeyValueMock }, KeyValueService],
		})
			.compile();

		await module.init();

		service = module.get<KeyValueService>(KeyValueService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should set a the cat as value and read it', async (done) => {
		await service.set(testValue.name, testValue);
		expect(await service.get(testValue.name)).toEqual(testValue);
		done();
	});

	it('should read a the cat as value', async (done) => {
		const result = await service.get(testValue.name);
		expect(result).toEqual(testValue);
		done();
	});

	it('should set teststring as value', async (done) => {
		await service.set('test', 'teststring')
		const result = await service.get('test');
		expect(result).toEqual('teststring');
		done();
	});

	it('should throw error after deleting teststring', async (done) => {
		try {
			await service.delete('test')
			const result = await service.get('test');
		} catch (err) {
			expect(err).toEqual(new Error('No value found for key "test".'));
			done();
		}
	});

	it('should add to redis set', async (done) => {
		await service.addToSet('cat_set', testValue);
		await service.addToSet('cat_set', 'teststring');
		expect(await service.getSet('cat_set')).toEqual([testValue, 'teststring']);
		done();
	});

	it('should delete redis set', async (done) => {
		await service.delete('cat_set');
		expect(await service.getSet('cat_set')).toEqual([]);
		done();
	});
});
