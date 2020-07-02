import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import * as RedisMock from 'ioredis-mock';
import { RedisModule } from '../../shared/redis/redis.module';
import { Player } from '../models';

describe('GameService', () => {
	let service: GameService;
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();
	let lobbyEventsTest;
	let lobbyId;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule],
      providers: [GameService],
		})
			.overrideProvider('redis_keyvalue').useValue(redisKeyValueMock)
			.overrideProvider('redis_pub').useValue(redisPubMock)
			.overrideProvider('redis_sub').useValue(redisSubMock)
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
