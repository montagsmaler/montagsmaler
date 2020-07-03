import { Module } from '@nestjs/common';
import { PubSubService } from './service/pubsub.service';
import { KeyValueModule } from '../keyvalue/keyvalue.module';
import { RedisconfigModule } from '../redisconfig/redisconfig.module';

@Module({
	imports: [RedisconfigModule, KeyValueModule],
	providers: [PubSubService],
	exports: [PubSubService],
})
export class PubSubModule {}
