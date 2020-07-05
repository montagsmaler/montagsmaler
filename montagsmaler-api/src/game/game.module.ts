import { Module } from '@nestjs/common';
import { GameService } from './service/game.service';
import { LobbyModule } from './lobby/lobby.module';
import { GameModule } from './game/game.module';
import { GameRoundModule } from './game-round/game-round.module';

@Module({
	imports: [LobbyModule, GameModule, GameRoundModule],
	providers: [GameService],
	exports: [GameService],
})
export class GameModule {}
