import { Module } from '@nestjs/common';
import { LobbyGateway } from './lobby-gateway';
import { GameModule } from '../../../game';

@Module({
	imports: [GameModule],
  providers: [LobbyGateway]
})
export class WsLobbyModule {}
