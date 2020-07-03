import { RedisOptions } from "ioredis";
import * as Redis from 'ioredis';
import { RedisMessageWrapper } from "./redis.models";
import { objectToClassInstance } from "../serializable";

export const redisClientFactory = (redisConfig: RedisOptions): Redis.Redis => new Redis(redisConfig);

export const getValueFromWrappedStringMessage = <T>(message: string): T => {
	let value = (JSON.parse(message) as RedisMessageWrapper).value;

	try {
		value = objectToClassInstance(value, { skipErrors: true });
	} catch (err) { }

	return value as T;
};

export const valueToWrappedStringMessage = <T>(value: T): string => JSON.stringify({ value } as RedisMessageWrapper);