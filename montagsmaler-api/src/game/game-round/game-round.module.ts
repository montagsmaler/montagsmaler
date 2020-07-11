import { Module, forwardRef } from '@nestjs/common';
import { GameRoundService } from './service/game-round.service';
import { RedisModule } from '../../shared/redis';
import { timeProvider } from './service/time.provider';
import { ImageModule } from '../image';

@Module({
	imports: [RedisModule, forwardRef(() => ImageModule)],
  providers: [...timeProvider, GameRoundService],
  exports: [...timeProvider, GameRoundService],
})
export class GameRoundModule {}
