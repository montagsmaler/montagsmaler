import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
import { redisClientFactory } from './redis.helper';

export const redisConfigProvider: Provider[] = [
	{
		provide: 'redis_config',
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
		provide: 'redis_keyvalue',
		useFactory: redisClientFactory,
		inject: ['redis_config'],
	},
	{
		provide: 'redis_sub',
		useFactory: redisClientFactory,
		inject: ['redis_config'],
	},
	{
		provide: 'redis_pub',
		useFactory: redisClientFactory,
		inject: ['redis_config'],
	},
];
