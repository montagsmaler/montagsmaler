import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions, Redis } from 'ioredis';
import { redisClientFactory } from '../redis.helper';
import * as Redlock from 'redlock';
import { RedisClient } from './redis-client.enum';

const REDIS_CONFIG = 'redis_config';

export const redisConfigProvider: Provider[] = [
	{
		provide: REDIS_CONFIG,
		useFactory: (configService: ConfigService): RedisOptions => {
			return {
				port: configService.get('REDIS_PORT') || 6379,
				host: configService.get('REDIS_HOST') || '127.0.0.1',
				family: 4, // 4 (IPv4) or 6 (IPv6)
				password: configService.get('REDIS_PASSWORD') || '',
				db: 0,
			};
		},
		inject: [ConfigService],
	},
	{
		provide: RedisClient.KEY_VALUE,
		useFactory: redisClientFactory,
		inject: [REDIS_CONFIG],
	},
	{
		provide: RedisClient.SUB,
		useFactory: redisClientFactory,
		inject: [REDIS_CONFIG],
	},
	{
		provide: RedisClient.PUB,
		useFactory: redisClientFactory,
		inject: [REDIS_CONFIG],
	},
	{
		provide: RedisClient.LOCK,
		useFactory: (redisClient: Redis) => {
			return new Redlock(
				[redisClient],
				{
					// the expected clock drift; for more details
					// see http://redis.io/topics/distlock
					driftFactor: 0.01, // time in ms
 
					// the max number of times Redlock will attempt
					// to lock a resource before erroring
					retryCount:  10,
 
					// the time in ms between attempts
					retryDelay:  200, // time in ms
 
					// the max time in ms randomly added to retries
					// to improve performance under high contention
					// see https://www.awsarchitectureblog.com/2015/03/backoff.html
					retryJitter:  200 // time in ms
    		},
			);
		},
		inject: [RedisClient.KEY_VALUE],
	}
];
