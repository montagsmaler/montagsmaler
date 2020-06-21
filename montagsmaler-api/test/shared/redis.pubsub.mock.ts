interface OnNewPublish {
	onNewPublish(channel: string, message: string);
}

export class RedisPubMock {
	constructor(private redisSubMock: OnNewPublish, private redisSetMock: OnNewPublish) { }

	async publish(channel: string, message: string) {
		this.redisSubMock.onNewPublish(channel, message);
	}
	async zadd(channel: string, score, message: string) {
		this.redisSetMock.onNewPublish(channel, message);
	}
}

export class RedisSubMock implements OnNewPublish {
	cb = (_, __) => _;
	channels = []

	on(message, cb) {
		this.cb = cb;
	}

	subscribe(channel, cb) {
		cb(null);
	}

	onNewPublish(channel: string, message: string) {
		this.cb(channel, message);
	}
}

export class RedisSetMock implements OnNewPublish {
	private messagesByChannel = new Map<string, Set<string>>();

	async zrange(channel: string, startIndex: number, stopIndex: number) {
		return Array.from(this.messagesByChannel.get(channel));//.slice(startIndex, stopIndex);
	}

	onNewPublish(channel: string, message: string) {
		this.messagesByChannel.has(channel) ? this.messagesByChannel.get(channel).add(message) : this.messagesByChannel.set(channel, new Set<string>([message]));
	}
}