import { Module } from '@nestjs/common';
import { LobbyGateway } from './lobby-gateway';
import { GameModule } from '../../../game';
import { AuthModule } from '../../http/auth/auth.module';
import { ValidationModule } from '../../../shared/validation';

@Module({
	imports: [GameModule, AuthModule, ValidationModule],
  providers: [LobbyGateway]
})
export class WsLobbyModule {}
