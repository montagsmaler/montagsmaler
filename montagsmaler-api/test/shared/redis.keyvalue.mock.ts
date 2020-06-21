export class RedisKeyValueMock {
	map = new Map();

	async set(key, value) {
		this.map.set(key, value);
		return 'OK';
	}
	async get(key) {
		return this.map.get(key);
	}
	async exists(key) {
		return (this.map.has(key) ? 1 : 0);
	}
	async del(key) {
		this.map.delete(key);
	}
	async incr(key) {
		this.map.set(key, (this.map.get(key) || 0) + 1);
		return this.map.get(key);
	}
	async decr(key) {
		this.map.set(key, (this.map.get(key) || 0) - 1);
		return this.map.get(key);
	}
}
