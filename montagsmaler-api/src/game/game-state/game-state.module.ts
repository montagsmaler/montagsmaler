import { Module } from '@nestjs/common';
import { GameStateService } from './service/game-state.service';
import { GameRoundModule } from '../game-round/game-round.module';

@Module({
	imports: [GameRoundModule],
	providers: [GameStateService],
	exports: [GameStateService],
})
export class GameStateModule { }
