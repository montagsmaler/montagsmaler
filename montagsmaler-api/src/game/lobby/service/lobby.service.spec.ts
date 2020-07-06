import { Test, TestingModule } from '@nestjs/testing';
import * as RedisMock from 'ioredis-mock';
import { RedisClient, RedisModule } from '../../../shared/redis';
import { LobbyService } from './lobby.service';
import { Player } from '../../models';

describe('LobbyService', () => {
	let service: LobbyService;
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();
	let lobbyEventsTest;
	let lobbyId;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule],
			providers: [LobbyService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.compile();

		await module.init();

		service = module.get<LobbyService>(LobbyService);
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

	it('player should join and leave lobby', async (done) => {
		const player = new Player('12345678', 'Jonas');
		const [lobby, lobbyEvents] = await service.joinLobby(lobbyId, player);
		expect(lobby.playerCount()).toEqual(3);
		await service.leaveLobby(lobbyId, player);
		expect((await service.getLobby(lobbyId)).playerCount()).toEqual(2);
		done();
	});
});

