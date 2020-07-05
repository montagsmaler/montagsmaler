import { Module } from '@nestjs/common';
import { LobbyService } from './service/lobby.service';
import { RedisModule } from '../../shared/redis';

@Module({
	imports: [RedisModule],
	providers: [LobbyService],
	exports: [LobbyService],
})
export class LobbyModule {}
