import { Module, forwardRef } from '@nestjs/common';
import { ImageService } from './service/image.service';
import { GameRoundModule } from '../game-round/game-round.module';
import { RedisModule } from '../../shared/redis';
import { S3Module } from '../../api/http/s3';
import { RecognitionModule } from '../../api/http/recognition';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [RedisModule, forwardRef(() => GameRoundModule), S3Module, RecognitionModule, ConfigModule],
	providers: [ImageService],
	exports: [ImageService],
})
export class ImageModule { }
