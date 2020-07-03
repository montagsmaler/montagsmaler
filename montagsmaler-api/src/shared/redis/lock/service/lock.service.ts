import { Injectable, Inject } from '@nestjs/common';
import * as Redlock from 'redlock';
import { Lock } from 'redlock';

@Injectable()
export class LockService {
	constructor(
		@Inject('redis_lock') private readonly redLockClient: Redlock,
	) { }

	public async lockRessource(key: string, ttl = 1000): Promise<Lock> {
		try {
			return await this.redLockClient.lock('locks:' + key, ttl);
		} catch (err) {
			throw new Error('Could not acquire lock');
		}
	}
}
