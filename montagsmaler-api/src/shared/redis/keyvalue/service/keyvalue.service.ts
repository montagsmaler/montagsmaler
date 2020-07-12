import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { valueToWrappedStringMessage, getValueFromWrappedStringMessage } from '../../redis.helper';
import { RedisClient } from '../../redisconfig/redis-client.enum';

const SET_SCORE = 'set_score:';

@Injectable()
export class KeyValueService {

	constructor(
		@Inject(RedisClient.KEY_VALUE) private readonly redisKeyValue: Redis,
	) { }

	public async set<T>(key: string, value: T, expireInSeconds?: number): Promise<void> {
		try {
			const wrappedMsgAsString = valueToWrappedStringMessage<T>(value);
			const result = (expireInSeconds) ? await this.redisKeyValue.set(key, wrappedMsgAsString, 'ex', expireInSeconds) : await this.redisKeyValue.set(key, wrappedMsgAsString);
			if (result !== 'OK') {
				throw new Error(`Could not set value for key "${key}".`);
			}
		} catch (err) {
			throw new Error(`Could not set value for key "${key}".`);
		}
	}

	public async addToSet<T>(set: string, value: T): Promise<void> {
		try {
			const wrappedMsgAsString = valueToWrappedStringMessage<T>(value);
			await this.redisKeyValue.zadd(set, await this.increment(SET_SCORE), wrappedMsgAsString);
		} catch (err) {
			throw new Error(`Could not add value to set "${set}"`);
		}
	}

	public async getSet<T>(set: string, startIndex = 0, stopIndex = -1): Promise<T[]> {
		try {
			return (await this.redisKeyValue.zrange(set, startIndex, stopIndex)).map(wrapper => getValueFromWrappedStringMessage<T>(wrapper));
		} catch (err) {
			throw new Error(`Could not retrieve set "${set}" with the specified indices.`);
		}
	}

	public async get<T>(key: string): Promise<T> {
		try {
			return getValueFromWrappedStringMessage<T>(await this.redisKeyValue.get(key));
		} catch (err) {
			throw new Error(`No value found for key "${key}".`);
		}
	}

	public async has(key: string): Promise<boolean> {
		return (await this.redisKeyValue.exists(key) === 1) ? true : false;
	}

	public async delete(key: string): Promise<void> {
		try {
			await this.redisKeyValue.del(key);
		} catch (err) {
			throw new Error(`Key "${key}" could not be deleted.`);
		}
	}

	public async getInt(key: string): Promise<number> {
		try {
			return parseInt(await this.redisKeyValue.get(key), 10);
		} catch (err) {
			throw new Error(`No intvalue found for key "${key}".`);
		}
	}

	public async setInt(key: string, int: number): Promise<void> {
		try {
			const result = await this.redisKeyValue.set(key, int);
			if (result !== 'OK') {
				throw new Error();
			}
		} catch (err) {
			throw new Error(`Could not set intvalue for key "${key}".`);
		}
	}

	public async increment(key: string): Promise<number> {
		return await this.redisKeyValue.incr(key);
	}

	public async decrement(key: string): Promise<number> {
		return await this.redisKeyValue.decr(key);
	}
}
