import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameModule } from '../../../game';
import { AuthModule } from '../../http/auth/auth.module';
import { ValidationModule } from '../../../shared/validation';

@Module({
	imports: [GameModule, AuthModule, ValidationModule],
  providers: [GameGateway]
})
export class WsGameModule {}
