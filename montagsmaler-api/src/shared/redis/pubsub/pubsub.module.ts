import { Module, forwardRef } from '@nestjs/common';
import { PubSubService } from './service/pubsub.service';
import { RedisModule } from '../redis.module';
import { KeyValueModule } from '../keyvalue/keyvalue.module';

@Module({
	imports: [forwardRef(() => RedisModule), KeyValueModule],
	providers: [PubSubService],
	exports: [PubSubService],
})
export class PubSubModule {}
