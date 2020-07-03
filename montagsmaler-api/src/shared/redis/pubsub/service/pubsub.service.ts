import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { RedisOnResult } from './pubsub.models';
import { filter, map } from 'rxjs/internal/operators';
import { KeyValueService } from '../../keyvalue/service/keyvalue.service';
import { getValueFromWrappedStringMessage, valueToWrappedStringMessage } from '../../redis.helper';

const SET = 'set:'

@Injectable()
export class PubSubService implements OnModuleInit {

	private readonly redisSubSubject = new Subject<RedisOnResult>();

	constructor(
		@Inject('redis_sub') private readonly redisSub: Redis,
		@Inject('redis_pub') private readonly redisPub: Redis,
		private readonly keyValueService: KeyValueService,
	) { }

	public onModuleInit(): void {
		this.redisSub.on('message', (channel, message) => {
			this.redisSubSubject.next({ channel, message });
		});
	}

	public onChannelPub<T>(channel: string): Observable<T> {
		const subForChannel = this.redisSubSubject.pipe(
			filter(result => result.channel === channel),
			map(result => {
				if (result.error) {
					throw new Error(`Could not subscribe to channel "${channel}".`);
				} else {
					return getValueFromWrappedStringMessage<T>(result.message);
				}
			}),
		);
		this.redisSub.subscribe(channel, (error, count) => {
			if (error) {
				setTimeout(() => this.redisSubSubject.next({ channel, error }));
			}
		});
		return subForChannel;
	}

	public async getChannelHistory<T>(channel: string): Promise<T[]> {
		try {
			return await this.keyValueService.getSet<T>(SET + channel);
		} catch (err) {
			return [];
		}
	}

	public async pubToChannel<T>(channel: string, value: T): Promise<void> {
		try {
			const wrappedMsgAsString = valueToWrappedStringMessage(value);
			await Promise.all([this.redisPub.publish(channel, wrappedMsgAsString), this.keyValueService.addToSet<T>(SET + channel, value)]);
		} catch (err) {
			throw new Error(`Failed to publish value to channel "${channel}".`);
		}
	}

	public async deleteChannelHistory(channel: string): Promise<void> {
		await this.keyValueService.delete(SET + channel);
	}
}
