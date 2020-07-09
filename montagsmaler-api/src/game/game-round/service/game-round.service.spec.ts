import { Test, TestingModule } from '@nestjs/testing';
import { GameRoundService } from './game-round.service';
import { RedisModule, RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { timeProvider } from './time.provider';
import { GameStateModule } from '../../game-state';
import { Lobby } from '../../lobby/models';
import { GameOverEvent } from '../models';

describe('GameRoundService', () => {
	let service: GameRoundService;

	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule, GameStateModule],
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

	it('should run game and gameloop', async (done) => {
		const [game, events] = await service.initGame(new Lobby('1234', new Date().getTime(), []), 1, 3);
		expect(game.duration).toEqual(3);
		events.subscribe(event => {
			//console.log(event);
			if (event instanceof GameOverEvent) {
				done();
			}
		});
	});
});
