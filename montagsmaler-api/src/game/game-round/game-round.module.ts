import { Module } from '@nestjs/common';
import { GameRoundService } from './service/game-round.service';
import { RedisModule } from '../../shared/redis';
import { timeProvider } from './service/time.provider';
import { GameStateModule } from '../game-state';

@Module({
	imports: [RedisModule, GameStateModule],
  providers: [...timeProvider, GameRoundService],
  exports: [GameRoundService],
})
export class GameRoundModule {}
