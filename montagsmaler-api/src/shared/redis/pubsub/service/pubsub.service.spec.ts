import { Test, TestingModule } from '@nestjs/testing';
import { PubSubService } from './pubsub.service';
import { first, skip } from 'rxjs/internal/operators';
import { Cat, Dog } from '../../../../../test/shared/cat.model';
import { RedisKeyValueMock } from '../../../../../test/shared/redis.keyvalue.mock';
import { RedisSetMock, RedisSubMock, RedisPubMock } from '../../../../../test/shared/redis.pubsub.mock';
import { KeyValueService } from '../../keyvalue/service/keyvalue.service';
const spyOn = jest.spyOn;

describe('PubsubService', () => {
	let service: PubSubService;
	const redisKeyValueMock = new RedisKeyValueMock();
	const redisSetMock = new RedisSetMock();
	const redisSubMock = new RedisSubMock();
	const redisPubMock = new RedisPubMock(redisSubMock, redisSetMock);
	const testCat = new Cat('Thomas', 8, 'black');
	const testCat2 = new Cat('Garfield', 10, 'white');
	const testDog = new Dog('Doggo', 12, 'Golden Retriever');
	const testDog2 = new Dog('Marla', 7, 'Beagle');
	const dogChannel = 'dogs31';
	const catChannel = 'cats31';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: 'redis_keyvalue', useValue: redisKeyValueMock },
				KeyValueService,
				{ provide: 'redis_pub', useValue: redisPubMock },
				{ provide: 'redis_sub', useValue: redisSubMock },
				{ provide: 'redis_set', useValue: redisSetMock },
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

	it('should remove dogs array', async () => {
		spyOn(service['keyValueService'], 'delete').mockImplementationOnce(async channel => { redisSetMock['messagesByChannel'].delete(channel) });
		await service.deleteChannelHistory(dogChannel);
		expect(await service.getChannelHistory(dogChannel)).toEqual([]);
	});
});
