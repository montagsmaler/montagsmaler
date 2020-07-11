import { Test, TestingModule } from '@nestjs/testing';
import { GameRoundService } from './game-round.service';
import { RedisModule, RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { timeProvider } from './time.provider';
import { Lobby } from '../../lobby/models';
import { GameOverEvent, GameStartedEvent, NewGameRoundEvent, GameImagesShouldPublishEvent, GameRoundOverEvent } from '../models';
import { forwardRef } from '@nestjs/common';
import { ImageModule } from '../../../game/image';

describe('GameRoundService', () => {
	let service: GameRoundService;

	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule, forwardRef(() => ImageModule)],
			providers: [...timeProvider, GameRoundService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.overrideProvider('SECOND_IN_MILLISECONDS').useValue(1)
			.compile();

		await module.init();

		service = module.get<GameRoundService>(GameRoundService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should create game and send gameloop events in correct oder', async (done) => {
		const [game, events] = await service.initGame(new Lobby('1234', new Date().getTime(), []), 1, 3);
		expect(game).toBeDefined();
		expect(game.duration).toEqual(3);
		expect(events).toBeDefined();
	
		let eventCount = 0;
		events.subscribe(event => {
			switch (eventCount) {
				case 0:
					expect(event instanceof GameStartedEvent).toBeTruthy();
					break;
				case 1:
					expect(event instanceof NewGameRoundEvent).toBeTruthy();
					break;
				case 2:
					expect(event instanceof GameImagesShouldPublishEvent).toBeTruthy();
					break;
				case 3:
					expect(event instanceof GameRoundOverEvent).toBeTruthy();
					break;
				case 4:
					expect(event instanceof NewGameRoundEvent).toBeTruthy();
					break;
				case 5:
					expect(event instanceof GameImagesShouldPublishEvent).toBeTruthy();
					break;
				case 6:
					expect(event instanceof GameRoundOverEvent).toBeTruthy();
					break;
				case 7:
					expect(event instanceof NewGameRoundEvent).toBeTruthy();
					break;
				case 8:
					expect(event instanceof GameImagesShouldPublishEvent).toBeTruthy();
					break;
				case 9:
					expect(event instanceof GameRoundOverEvent).toBeTruthy();
					break;
				case 10:
					expect(event instanceof GameOverEvent).toBeTruthy();
					done();
					break;
			}
			++eventCount;
		});
	});
});
