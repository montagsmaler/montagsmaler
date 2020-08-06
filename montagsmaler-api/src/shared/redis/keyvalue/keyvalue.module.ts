import { Module } from '@nestjs/common';
import { KeyValueService } from './service/keyvalue.service';
import { RedisconfigModule } from '../redisconfig/redisconfig.module';

@Module({
	imports: [RedisconfigModule],
	providers: [KeyValueService],
	exports: [KeyValueService],
})
export class KeyValueModule {}
