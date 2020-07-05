import { Module } from '@nestjs/common';
import { GameService } from './service/game.service';
import { LobbyModule } from './lobby/lobby.module';
import { GameRoundModule } from './game-round/game-round.module';
import { RedisModule } from '../shared/redis';

@Module({
	imports: [RedisModule, LobbyModule, GameRoundModule],
	providers: [GameService],
	exports: [GameService],
})
export class GameModule {}
