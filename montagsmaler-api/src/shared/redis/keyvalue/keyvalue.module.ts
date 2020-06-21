import { Module, forwardRef } from '@nestjs/common';
import { KeyValueService } from './service/keyvalue.service';
import { RedisModule } from '../redis.module';

@Module({
	imports: [forwardRef(() => RedisModule)],
	providers: [KeyValueService],
	exports: [KeyValueService],
})
export class KeyValueModule {}
