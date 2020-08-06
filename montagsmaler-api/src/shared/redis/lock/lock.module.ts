import { Module } from '@nestjs/common';
import { LockService } from './service/lock.service';
import { RedisconfigModule } from '../redisconfig/redisconfig.module';

@Module({
  imports: [RedisconfigModule],
	providers: [LockService],
	exports: [LockService],
})
export class LockModule {}
