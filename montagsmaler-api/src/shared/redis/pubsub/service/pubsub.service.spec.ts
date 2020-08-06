import { Test, TestingModule } from '@nestjs/testing';
import { PubSubService } from './pubsub.service';
import { first, skip } from 'rxjs/internal/operators';
import * as RedisMock from 'ioredis-mock';
import { Cat, Dog } from '../../../../../test/shared/cat.model';
import { KeyValueService } from '../../keyvalue/service/keyvalue.service';
import { RedisClient } from '../../redisconfig/redis-client.enum';
const spyOn = jest.spyOn;

describe('PubsubService', () => {
	let service: PubSubService;

	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();

	const testCat = new Cat('Thomas', 8, 'black');
	const testCat2 = new Cat('Garfield', 10, 'white');
	const testDog = new Dog('Doggo', 12, 'Golden Retriever');
	const testDog2 = new Dog('Marla', 7, 'Beagle');
	const dogChannel = 'dogs101';
	const catChannel = 'cats101';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: RedisClient.KEY_VALUE, useValue: redisKeyValueMock },
				KeyValueService,
				{ provide: RedisClient.PUB, useValue: redisPubMock },
				{ provide: RedisClient.SUB, useValue: redisSubMock },
				PubSubService,
			],
		})
			.compile();

		await module.init();

		service = module.get<PubSubService>(PubSubService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should send a cat', async (done) => {
		service.onChannelPub<Cat>(catChannel).pipe(first()).subscribe(cat => {
			expect(cat).toEqual(testCat);
			done();
		});
		await service.pubToChannel(catChannel, testCat);
	});

	it('should publish and receive a bunch of cats and dogs', async (done) => {
		service.onChannelPub<Cat>(catChannel).pipe(first()).subscribe(cat => {
			expect(cat).toEqual(testCat);
		});
		service.onChannelPub<Dog>(dogChannel).pipe(first()).subscribe(dog => {
			expect(dog).toEqual(testDog);
		});
		service.onChannelPub<Cat>(catChannel).pipe(skip(1)).subscribe(cat => {
			expect(cat).toEqual(testCat2);
		});
		service.onChannelPub<Dog>(dogChannel).pipe(skip(1)).subscribe(dog => {
			expect(dog).toEqual(testDog2);
			done();
		});
		await service.pubToChannel(dogChannel, testDog);
		await service.pubToChannel(catChannel, testCat);
		await service.pubToChannel(catChannel, testCat2);
		await service.pubToChannel(dogChannel, testDog2);
	});

	it('should get an array of cats and dogs', async (done) => {
		expect(await service.getChannelHistory(catChannel)).toEqual([testCat, testCat2]);
		expect(await service.getChannelHistory(dogChannel)).toEqual([testDog, testDog2]);
		done();
	});

	it('should remove dogs array', async (done) => {
		await service.deleteChannelHistory(dogChannel);
		expect(await service.getChannelHistory(dogChannel)).toEqual([]);
		done();
	});

	it('should fail to publish to channel', async (done) => {
		try {
			spyOn(service['keyValueService'], 'addToSet').mockImplementationOnce(async () => {throw new Error()});
			await service.pubToChannel('chickens', testDog);
		} catch (err) {
			expect(err).toEqual(new Error('Failed to publish value to channel "chickens".'));
			done();
		}
	});

	it('should get error on pub', async (done) => {
		spyOn(service['redisSub'] as any, 'subscribe').mockImplementationOnce((channel, cb: any) => {
			cb(new Error('Subscribe fail!'), null);
		});
		
		service.onChannelPub(catChannel).subscribe(
			res => res,
			err => {
				expect(err).toEqual(new Error(`Could not subscribe to channel "${catChannel}".`));
				done();
			}
		);
	});
});
