import { Module } from '@nestjs/common';
import { GameService } from './service/game.service';
import { LobbyModule } from './lobby/lobby.module';
import { GameRoundModule } from './game-round/game-round.module';
import { RedisModule } from '../shared/redis';
import { GameStateModule } from './game-state/game-state.module';
import { ImageModule } from './image/image.module';

@Module({
	imports: [RedisModule, LobbyModule, GameRoundModule, GameStateModule, ImageModule],
	providers: [GameService],
	exports: [GameService],
})
export class GameModule { }
