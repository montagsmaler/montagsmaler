import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisMessageWrapper } from '../../redis.models';

@Injectable()
export class KeyValueService {
	constructor(
		@Inject('redis_keyvalue') private readonly redisKeyValue: Redis,
	) { }

	public async set<T>(key: string, value: T): Promise<void> {
		try {
			const stringmsg = JSON.stringify({value} as RedisMessageWrapper);
			const result = await this.redisKeyValue.set(key, stringmsg);
			if (result !== 'OK') {
				throw new Error(`Could not set value for key "${key}".`);
			}
		} catch (err) {
			throw new Error(`Could not set value for key "${key}".`);
		}
	}

	public async get<T>(key: string): Promise<T> {
		try {
			return (JSON.parse(await this.redisKeyValue.get(key)) as RedisMessageWrapper).value;
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

	public async increment(key: string): Promise<number> {
		return await this.redisKeyValue.incr(key);
	}

	public async decrement(key: string): Promise<number> {
		return await this.redisKeyValue.decr(key);
	}
}
