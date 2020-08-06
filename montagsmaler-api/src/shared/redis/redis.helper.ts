import { RedisOptions } from 'ioredis';
import * as Redis from 'ioredis';
import { RedisMessageWrapper } from './redis.models';
import { objectToClassInstance } from '../serializable';
import { parse, stringify } from 'flatted';

export const redisClientFactory = (redisConfig: RedisOptions): Redis.Redis => new Redis(redisConfig);

export const getValueFromWrappedStringMessage = <T>(message: string): T => {
	const value = (parse(message) as RedisMessageWrapper).value;
	return objectToClassInstance<T>(value, { ignoreErrors: true });
};

export const valueToWrappedStringMessage = <T>(value: T): string => stringify({ value } as RedisMessageWrapper);