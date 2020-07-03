import { RedisOptions } from "ioredis";
import * as Redis from 'ioredis';
import { RedisMessageWrapper } from "./redis.models";
import { objectToClassInstance } from "../serializable";

export const redisClientFactory = (redisConfig: RedisOptions): Redis.Redis => new Redis(redisConfig);

export const getValueFromWrappedStringMessage = <T>(message: string): T => {
	return objectToClassInstance<T>((JSON.parse(message) as RedisMessageWrapper).value, { ignoreErrors: true });
};

export const valueToWrappedStringMessage = <T>(value: T): string => JSON.stringify({ value } as RedisMessageWrapper);