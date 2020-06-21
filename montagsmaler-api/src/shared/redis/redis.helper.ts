import { RedisOptions } from "ioredis";
import * as Redis from 'ioredis';

export const redisClientFactory = (redisConfig: RedisOptions): Redis.Redis => new Redis(redisConfig);