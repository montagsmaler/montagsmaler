import { Test, TestingModule } from '@nestjs/testing';
import { GameStateService } from './game-state.service';
import { RedisModule, RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { Subject, Observable } from 'rxjs';
import { Player } from '../../lobby/models';
import { Game, GameEvent, GameStartedEvent, GameEvents, NewGameRoundEvent, GameRoundOverEvent, Image } from '../../game-round/models';
import { first } from 'rxjs/internal/operators';
import { IStateAccepted } from '..';

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
	let stateAccepted: Observable<{ eventType: GameEvents, stateAccepted: IStateAccepted }>;

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

	it('should register game', async (done) => {
		stateAccepted = await service.registerGame(testGame, fakeGameEvents.asObservable());
		stateAccepted.pipe(first()).subscribe(result => {
			expect(result.stateAccepted.currentState).toEqual('GameNotStarted');
			expect(result.stateAccepted.accepted).toBeTruthy();
			done();
		});
		fakeGameEvents.next(new GameStartedEvent(0, testGame));
	});

	it('should throw error state not accepted', (done) => {
		stateAccepted.pipe(first()).subscribe(result => {
			expect(result.stateAccepted.currentState).toEqual('GameStarted');
			expect(result.stateAccepted.accepted).toBeFalsy();
			done();
		});
		fakeGameEvents.next(new GameStartedEvent(1, testGame));
	});

	it('should accept next state', (done) => {
		stateAccepted.pipe(first()).subscribe(result => {
			expect(result.stateAccepted.currentState).toEqual('GameStarted');
			expect(result.stateAccepted.accepted).toBeTruthy();
			done();
		});
		fakeGameEvents.next(new NewGameRoundEvent(2, testGame, 'bird', 1, new Date().getTime()));
	});

	it('should accept image publish', async () => {
		const stateAccepted = await service.canPublishImage(testGame.id, testPlayer.id, 1);
		expect(stateAccepted.accepted).toBeTruthy();
	});

	it('should not accept image publish', async () => {
		expect((await service.canPublishImage(testGame.id, testPlayer.id, 1)).accepted).toBeFalsy(); //already submitd for the round
		expect((await service.canPublishImage(testGame.id, '1313131221', 1)).accepted).toBeFalsy(); //unknown player id
		expect((await service.canPublishImage(testGame.id, testPlayer.id, 2)).accepted).toBeFalsy(); // next round hasnt started yet
	});

	it('should throw error unknown gameid', async (done) => {
		try {
			const stateAccepted = await service.canPublishImage('adasdasda', testPlayer2.id, 1);
		} catch (err) {
			expect(err.message).toEqual('Could not retrieve GameState.');
			done();
		}
	});

	it('should accept next state', (done) => {
		stateAccepted.pipe(first()).subscribe(result => {
			expect(result.stateAccepted.currentState).toEqual('RoundStarted');
			expect(result.stateAccepted.accepted).toBeTruthy();
			done();
		});
		const newImage = new Image('imageid', new Date().getTime(), '213131.de', testPlayer, 1, 20);
		fakeGameEvents.next(new GameRoundOverEvent(3, testGame, 1, [newImage]));
	});

	it('should accept next state', (done) => {
		stateAccepted.pipe(first()).subscribe(result => {
			expect(result.stateAccepted.currentState).toEqual('RoundEnded');
			expect(result.stateAccepted.accepted).toBeTruthy();
			done();
		});
		fakeGameEvents.next(new NewGameRoundEvent(4, testGame, 'bird', 2, new Date().getTime()));
	});

	it('should accept image publish now', async () => {
		expect((await service.canPublishImage(testGame.id, testPlayer.id, 2)).accepted).toBeTruthy(); // next round hasnt started yet
	});

});
