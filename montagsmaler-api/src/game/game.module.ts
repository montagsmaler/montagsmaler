import { Module } from '@nestjs/common';
import { GameService } from './service/game.service';
import { RedisModule } from '../shared/redis/redis.module';

@Module({
	imports: [RedisModule],
	providers: [GameService],
	exports: [GameService],
})
export class GameModule {}
