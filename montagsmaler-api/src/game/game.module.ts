import { Module } from '@nestjs/common';
import { GameService } from './service/game.service';
import { PubSubModule } from '../shared/redis/pubsub/pubsub.module';
import { KeyValueModule } from '../shared/redis/keyvalue/keyvalue.module';

@Module({
	imports: [PubSubModule, KeyValueModule],
	providers: [GameService],
	exports: [GameService],
})
export class GameModule {}
