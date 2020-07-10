import { Module } from '@nestjs/common';
import { GameRoundService } from './service/game-round.service';
import { RedisModule } from '../../shared/redis';
import { timeProvider } from './service/time.provider';
@Module({
	imports: [RedisModule],
  providers: [...timeProvider, GameRoundService],
  exports: [...timeProvider, GameRoundService],
})
export class GameRoundModule {}
