import { Module } from '@nestjs/common';
import { KeyValueModule } from './keyvalue/keyvalue.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { ConfigModule } from '@nestjs/config';
import { redisConfigProvider } from './redis.config.provider';

@Module({
	imports: [ConfigModule, KeyValueModule, PubSubModule],
	providers: [...redisConfigProvider],
	exports: [...redisConfigProvider, KeyValueModule, PubSubModule],
})
export class RedisModule {}
