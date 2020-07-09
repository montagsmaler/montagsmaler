import { Test, TestingModule } from '@nestjs/testing';
import { LobbyGateway } from './lobby-gateway';
import { GameModule } from '../../../game';
import { RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';

describe('GameGateway', () => {
	let gateway: LobbyGateway;
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
			imports: [GameModule],
      providers: [LobbyGateway],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.overrideProvider('SECOND_IN_MILLISECONDS').useValue(1)
			.compile();

		await module.init();

    gateway = module.get<LobbyGateway>(LobbyGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});