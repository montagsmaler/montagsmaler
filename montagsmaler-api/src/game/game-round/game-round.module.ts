import { Module } from '@nestjs/common';
import { GameRoundService } from './game-round/game-round.service';

@Module({
  providers: [GameRoundService],
  exports: [GameRoundService],
})
export class GameRoundModule {}
