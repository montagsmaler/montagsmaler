import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import * as RedisMock from 'ioredis-mock';
import { LobbyModule } from '../lobby/lobby.module';
import { RedisModule, RedisClient } from '../../shared/redis';
import { GameRoundModule } from '../game-round/game-round.module';
import { Player, Lobby, LobbyEvent } from '../lobby/models';
import { GameStateModule } from '../game-state';
import { Observable } from 'rxjs';
import { LobbyConsumedEvent } from '../lobby/models/events/lobby.consumed.event';
import { first } from 'rxjs/internal/operators';
import { GameEvent, Game, GameStartedEvent } from '../game-round/models';

describe('GameService', () => {
	let service: GameService;
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();
	const testPlayer = new Player('12345', 'Lucas');
	const testPlayer2 = new Player('1234567', 'Markus');

	let lobbyEvents: Observable<LobbyEvent>;
	let lobby: Lobby;
	let gameEvents: Observable<GameEvent>;
	let game: Game;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule, LobbyModule, GameRoundModule, GameStateModule],
      providers: [GameService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.overrideProvider('SECOND_IN_MILLISECONDS').useValue(1)
			.compile();
		
		await module.init();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
	});
	
	it('should init lobby', async (done) => {
		[lobby, lobbyEvents] = await service.initLobby(testPlayer);
		expect(lobby).toBeDefined();
		expect(lobbyEvents).toBeDefined();
		expect(lobby.playerCount()).toEqual(1);
		done();
	});
	
	it('player should join lobby', async (done) => {
		const [lobbyPlayer, lobbyEventsPlayer] = await service.joinLobby(lobby.id, testPlayer2);
		expect(lobbyPlayer.playerCount()).toEqual(2);
		done();
	});
	
	it('should throw error since player is not lobby leader', async (done) => {
		try {
			const [game, gameEvents] = await service.initGame(lobby.id, testPlayer2, { roundDuration: 5, rounds: 2 });
		} catch (err) {
			expect(err.message).toEqual('Player is not authorized to start the lobby.');
			done();
		}
	});

	it('should init game', async (done) => {
		lobbyEvents.pipe(first()).subscribe(lobbyEvent => {
			expect(lobbyEvent instanceof LobbyConsumedEvent).toBeTruthy();
		})
		const [newGame, events]  = await service.initGame(lobby.id, testPlayer, { roundDuration: 5, rounds: 2 });
		game = newGame;
		gameEvents = events;
		gameEvents.pipe(first()).subscribe(gameEvent => {
			expect(gameEvent instanceof GameStartedEvent).toBeTruthy();
			done();
		});
		expect(game).toBeDefined();
		expect(gameEvents).toBeDefined();
	});
});
