import { Module } from '@nestjs/common';
import { WsLobbyModule } from './lobby/ws.lobby.module';
import { WsGameModule } from './game/ws.game.module';

@Module({
	imports: [WsLobbyModule, WsGameModule],
})
export class WsModule { }
