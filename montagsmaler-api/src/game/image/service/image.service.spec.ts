import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { forwardRef } from '@nestjs/common';
import { GameRoundModule } from '../../game-round/game-round.module';
import { RedisModule, RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from '../../../api/http/s3';
import { RecognitionModule } from '../../../api/http/recognition';

describe('ImageService', () => {
	let service: ImageService;

	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();


	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [RedisModule, forwardRef(() => GameRoundModule), ConfigModule, S3Module, RecognitionModule],
			providers: [ImageService],
		})
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.overrideProvider('SECOND_IN_MILLISECONDS').useValue(1)
			.compile();

		await module.init();

		service = module.get<ImageService>(ImageService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
