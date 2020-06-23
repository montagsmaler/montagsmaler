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

	it('should set a the cat as value and read it', async () => {
		await service.set(testValue.name, testValue);
		expect(await service.get(testValue.name)).toEqual(testValue);
	});

	it('should read a the cat as value', async () => {
		const result = await service.get(testValue.name);
		expect(result).toEqual(testValue);
	});

	it('should set teststring as value', async () => {
		await service.set('test', 'teststring')
		const result = await service.get('test');
		expect(result).toEqual('teststring');
	});

	it('should throw error after deleting teststring', async () => {
		try {
			await service.delete('test')
			const result = await service.get('test');
		} catch (err) {
			expect(err).toEqual(new Error('No value found for key "test".'));
		}
	});
});
