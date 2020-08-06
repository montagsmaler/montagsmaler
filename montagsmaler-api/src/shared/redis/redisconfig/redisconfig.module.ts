import { Module } from '@nestjs/common';
import { redisConfigProvider } from './redis.config.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [ConfigModule],
	providers: [...redisConfigProvider],
	exports: [...redisConfigProvider],
})
export class RedisconfigModule {}
