import { Module } from '@nestjs/common';
import { KeyValueModule } from './keyvalue/keyvalue.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { LockModule } from './lock/lock.module';

@Module({
	imports: [KeyValueModule, PubSubModule, LockModule],
	providers: [],
	exports: [KeyValueModule, PubSubModule, LockModule],
})
export class RedisModule {}
