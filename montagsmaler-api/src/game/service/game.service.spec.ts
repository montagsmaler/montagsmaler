import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import * as RedisMock from 'ioredis-mock';
import { Player } from '../models';
import { LobbyModule } from '../lobby/lobby.module';
import { RedisModule, RedisClient } from '../../shared/redis';
import { GameRoundModule } from '../game-round/game-round.module';

describe('GameService', () => {
	let service: GameService;
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();
	let lobbyEventsTest;
	let lobbyId;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule, LobbyModule, GameRoundModule],
      providers: [GameService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.compile();
		
		await module.init();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
	});
	
	it('should init lobby', async (done) => {
		const [lobby, lobbyEvents] = await service.initLobby(new Player('12345', 'Lucas'));
		lobbyEventsTest = lobbyEvents;
		lobbyId = lobby.id;
		expect(lobby.playerCount()).toEqual(1);
		done();
	});
	
	it('player should join lobby', async (done) => {
		const [lobby, lobbyEvents] = await service.joinLobby(lobbyId, new Player('1234567', 'Markus'));
		expect(lobby.playerCount()).toEqual(2);
		done();
  });
});
