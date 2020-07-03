import { Module, forwardRef } from '@nestjs/common';
import { LockService } from './service/lock.service';
import { RedisModule } from '../redis.module';

@Module({
  imports: [forwardRef(() => RedisModule)],
	providers: [LockService],
	exports: [LockService],
})
export class LockModule {}
