import { Test, TestingModule } from '@nestjs/testing';
import { GameStateService } from './game-state.service';
import { RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { Player } from '../../lobby/models';
import { Game, GameStartedEvent, NewGameRoundEvent, GameRoundOverEvent, Image, GameImageAddedEvent } from '../../game-round/models';
import { GameRoundModule } from '../../game-round/game-round.module';
import { GameRoundService } from '../../game-round/service/game-round.service';

describe('GameStateService', () => {
	let gameStateService: GameStateService;
	let gameRoundService: GameRoundService;

	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();

	const testGameId = 'game12345678';
	const testPlayer = new Player('player12345', 'niklas');
	const testPlayer2 = new Player('player54321', 'lucas');
	const testGame = new Game(testGameId, new Date().getTime(), [testPlayer, testPlayer2], 75_000, 6);
	const testImage = new Image('imageid1', new Date().getTime(), '213131.de', testPlayer, 1, 20);

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [GameRoundModule],
			providers: [GameStateService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.compile();

		await module.init();

		gameRoundService = module.get<GameRoundService>(GameRoundService);
		gameStateService = module.get<GameStateService>(GameStateService);
	});

	it('should be defined', () => {
		expect(gameRoundService).toBeDefined();
		expect(gameStateService).toBeDefined();
	});

	it('should accept image publish', async () => {
		await gameRoundService['setGame'](testGame.id, testGame);
		await gameRoundService.pubGameEvent(testGame.id, new GameStartedEvent(1, testGame));
		await gameRoundService.pubGameEvent(testGame.id, new NewGameRoundEvent(2, testGame, 'bird', 1, new Date().getTime()));
		const stateAccepted = await gameStateService.canPublishImage(testGame.id, testPlayer.id, 1);
		await gameRoundService.pubGameEvent(testGame.id, new GameImageAddedEvent(3, testGame.id, testImage));
		expect(stateAccepted.accepted).toBeTruthy();
	});

	it('should not accept image publish', async () => {
		expect((await gameStateService.canPublishImage(testGame.id, testPlayer.id, 1)).accepted).toBeFalsy(); //already submitd for the round
		expect((await gameStateService.canPublishImage(testGame.id, '1313131221', 1)).accepted).toBeFalsy(); //unknown player id
		expect((await gameStateService.canPublishImage(testGame.id, testPlayer.id, 2)).accepted).toBeFalsy(); // next round hasnt started yet
	});

	it('should throw error unknown gameid', async (done) => {
		try {
			const stateAccepted = await gameStateService.canPublishImage('adasdasda', testPlayer2.id, 1);
		} catch (err) {
			expect(err.message).toEqual('Could not retrieve GameState.');
			done();
		}
	});

	it('should accept image publish now', async () => {
		await gameRoundService.pubGameEvent(testGame.id, new GameRoundOverEvent(4, testGame, 1, [testImage]));
		await gameRoundService.pubGameEvent(testGame.id, new NewGameRoundEvent(5, testGame, 'bird', 2, new Date().getTime()));
		expect((await gameStateService.canPublishImage(testGame.id, testPlayer.id, 2)).accepted).toBeTruthy(); // next round hasnt started yet
	});

});
