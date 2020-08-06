import { Module } from '@nestjs/common';
import { KeyValueModule } from './keyvalue/keyvalue.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { LockModule } from './lock/lock.module';
import { IdModule } from './id/id.module';

@Module({
	imports: [KeyValueModule, PubSubModule, LockModule, IdModule],
	providers: [],
	exports: [KeyValueModule, PubSubModule, LockModule, IdModule],
})
export class RedisModule {}
