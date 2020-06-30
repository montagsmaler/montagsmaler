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

	it('should throw an error while adding key value pair', async (done) => {
		spyOn(service['redisKeyValue'], 'set').mockImplementationOnce(async () => {throw new Error()});
		try {
			await service.set('cat', testValue);
		} catch (err) {
			expect(err).toEqual(new Error('Could not set value for key "cat".'));
			done();
		}
	});

	it('should throw an error while adding key value pair', async (done) => {
		spyOn(service['redisKeyValue'], 'set').mockImplementationOnce(async () => 'NOT_OK');
		try {
			await service.set('cat', testValue);
		} catch (err) {
			expect(err).toEqual(new Error('Could not set value for key "cat".'));
			done();
		}
	});

	it('should throw an error while adding to set', async (done) => {
		spyOn(service['redisKeyValue'], 'zadd').mockImplementationOnce(async () => {throw new Error()});
		try {
			await service.addToSet('cat_set', testValue);
		} catch (err) {
			expect(err).toEqual(new Error('Could not add value to set "cat_set"'));
			done();
		}
	});

	it('should retrieve slice set from set', async (done) => {
		const testValues = [1, 2, 3, 4, 5, 6];
		for (const value of testValues) {
			await service.addToSet('test_value_set', value);
		}
		expect(await service.getSet('test_value_set')).toEqual(testValues);
		expect(await service.getSet('test_value_set', 2, 3)).toEqual(testValues.slice(2, 4));
		expect(await service.getSet('test_value_set', 1, 5)).toEqual(testValues.slice(1, 6));
		expect(await service.getSet('test_value_set', 4)).toEqual(testValues.slice(4));
		expect(await service.getSet('test_value_set', 3, 3)).toEqual(testValues.slice(3, 4));
		done();
	});

	it('should increment key', async (done) => {
		await service.increment('inc_key');
		expect(await service.getInt('inc_key')).toEqual(1);
		done();
	});

	it('should decrement key', async (done) => {
		await service.decrement('inc_key');
		expect(await service.getInt('inc_key')).toEqual(0);
		done();
	});

	it('set int and increment three times and decrement once', async (done) => {
		await service.setInt('inc_key', 5);
		await service.increment('inc_key');
		await service.decrement('inc_key');
		await service.increment('inc_key');
		await service.increment('inc_key');
		expect(await service.getInt('inc_key')).toEqual(7);
		done();
	});
});
