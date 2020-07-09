import { Module } from '@nestjs/common';
import { WsLobbyModule } from './lobby/ws.lobby.module';

@Module({
	imports: [WsLobbyModule],
})
export class WsModule {}
