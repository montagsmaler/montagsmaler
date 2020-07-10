import { Test, TestingModule } from '@nestjs/testing';
import { LobbyGateway } from './lobby-gateway';
import { GameModule } from '../../../game';
import { RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { AuthModule } from '../../http/auth/auth.module';
import { ValidationModule } from '../../../shared/validation';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

describe('LobbyGateway', () => {
	let gateway: LobbyGateway;
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
			imports: [GameModule, AuthModule, ValidationModule],
      providers: [LobbyGateway],
		})
			.overrideProvider('aws_cognito_user_pool').useValue(new CognitoUserPool({ UserPoolId: 'us-east-1_LKayH2xzJ', ClientId: 'imrcgq4gidp29idmtval97nsv' }))
			.overrideProvider('aws_cognito_issuer_url').useValue('127.0.0.1')
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