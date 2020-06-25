export interface RedisOnResult {
	channel: string,
	message?: string,
	error?: Error,
}