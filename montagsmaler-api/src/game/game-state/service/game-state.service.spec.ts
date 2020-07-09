import { Test, TestingModule } from '@nestjs/testing';
import { GameStateService } from './game-state.service';
import { RedisModule, RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { Subject, Observable } from 'rxjs';
import { sleep } from '../../../shared/helper';
import { Player } from '../../lobby/models';
import { Game, GameEvents, GameEvent } from '../../game-round/models';

describe('GameStateService', () => {
	let service: GameStateService;

	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();

	const testGameId = 'game12345678';
	const testPlayer = new Player('player12345', 'niklas');
	const testPlayer2 = new Player('player54321', 'lucas');
	const testGame = new Game(testGameId, new Date().getTime(), [testPlayer, testPlayer2], 75_000, 6);
	const fakeGameEvents = new Subject<GameEvent>();
	let stateAccepted: Observable<{ eventType: GameEvents, accepted: boolean }>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule],
			providers: [GameStateService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.compile();

		await module.init();

		service = module.get<GameStateService>(GameStateService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	/*it('should register game', async () => {
		try {
			stateAccepted = await service.registerGame(testGame, fakeGameEvents.asObservable());
			stateAccepted.subscribe(stateAccepted => {
				console.log(stateAccepted);
				expect(stateAccepted.accepted).toBeTruthy();
			});
			await sleep(0);
			fakeGameEvents.next(new GameStartedEvent(testGame));
		} catch (err) {}
	});*/

	/*it('should throw error state not accepted',	async (done) => {
		stateAccepted.pipe(first()).subscribe(accepted => {
			console.log(accepted);
			expect(accepted).toBeFalsy();
			done();
		});
		await sleep(0);
		fakeGameEvents.next(new GameStartedEvent(testGame));
	});*/
});
