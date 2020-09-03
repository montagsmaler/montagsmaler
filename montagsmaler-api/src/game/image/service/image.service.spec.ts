import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { forwardRef } from '@nestjs/common';
import { GameRoundModule } from '../../game-round/game-round.module';
import { RedisModule, RedisClient } from '../../../shared/redis';
import * as RedisMock from 'ioredis-mock';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from '../../../api/http/s3';
import { RecognitionModule } from '../../../api/http/recognition';
import { NewGameRoundEvent, Game } from '../../../game/game-round/models';
import { Player } from '../../../game/lobby/models/player';
const spyOn = jest.spyOn;

describe('ImageService', () => {
	let service: ImageService;

	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();
	const testGameId = 'game12345678';
	const testPlayer = new Player('player12345', 'niklas');
	const testPlayer2 = new Player('player54321', 'lucas');
	const testGame = new Game(testGameId, new Date().getTime(), [testPlayer, testPlayer2], 75_000, 6);
	const newGameRoundEvent = new NewGameRoundEvent(1, testGame, 'dog', 1, new Date().getTime());


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

		spyOn(service['gameRoundService'], 'getGameEvents').mockImplementation(async () => [newGameRoundEvent]);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should return image rating ', () => {
		expect(service['imageRating'](95.5, 1000, 1)).toEqual(955);
	});

	it('should return image and noun from round ', async () => {
		const [timeToPublish, noun] = await service['getTimeToPublishAndNoun'](testGameId, 1);
		expect(timeToPublish).toBeGreaterThan(0);
		expect(noun).toEqual('dog');
	});

});
