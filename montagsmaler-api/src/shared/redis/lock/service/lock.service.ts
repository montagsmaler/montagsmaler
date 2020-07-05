import { Injectable, Inject } from '@nestjs/common';
import * as Redlock from 'redlock';
import { Lock } from 'redlock';
import { RedisClient } from '../../redisconfig/redis-client.enum';

const LOCK = 'locks:';

@Injectable()
export class LockService {
	constructor(
		@Inject(RedisClient.LOCK) private readonly redLockClient: Redlock,
	) { }

	public async lockRessource(key: string, ttl = 1000): Promise<Lock> {
		try {
			return await this.redLockClient.lock(LOCK + key, ttl);
		} catch (err) {
			throw new Error('Could not acquire lock.');
		}
	}
}
