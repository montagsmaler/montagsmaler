import { Module } from '@nestjs/common';
import { KeyValueModule } from './keyvalue/keyvalue.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { ConfigModule } from '@nestjs/config';
import { redisConfigProvider } from './redis.config.provider';
import { LockModule } from './lock/lock.module';

@Module({
	imports: [ConfigModule, KeyValueModule, PubSubModule, LockModule],
	providers: [...redisConfigProvider],
	exports: [...redisConfigProvider, KeyValueModule, PubSubModule, LockModule],
})
export class RedisModule {}
