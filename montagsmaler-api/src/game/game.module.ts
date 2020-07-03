import { Module } from '@nestjs/common';
import { GameService } from './service/game.service';
import { LobbyModule } from './lobby/lobby.module';

@Module({
	imports: [LobbyModule],
	providers: [GameService],
	exports: [GameService],
})
export class GameModule {}
