import { Module, forwardRef } from '@nestjs/common';
import { ImageService } from './service/image.service';
import { GameRoundModule } from '../game-round/game-round.module';
import { RedisModule } from '../../shared/redis';

@Module({
	imports: [RedisModule, forwardRef(() => GameRoundModule)],
	providers: [ImageService],
	exports: [ImageService],
})
export class ImageModule { }
