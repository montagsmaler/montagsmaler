import { Module } from '@nestjs/common';
import { GameStateService } from './service/game-state.service';
import { RedisModule } from '../../shared/redis';

@Module({
	imports: [RedisModule],
	providers: [GameStateService],
	exports: [GameStateService],
})
export class GameStateModule { }
