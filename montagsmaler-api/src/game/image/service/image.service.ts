import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { KeyValueService } from '../../../shared/redis';
import { GameImageAddedEvent, GameEvents, NewGameRoundEvent } from '../../../game/game-round/models';
import { Image } from '../models';
import { GameRoundService } from '../../../game/game-round/service/game-round.service';
import { Player } from '../../lobby/models';

const IMAGES = 'images:';

@Injectable()
export class ImageService {

	constructor(
		private readonly keyValueService: KeyValueService,
		@Inject(forwardRef(() => GameRoundService)) private readonly gameRoundService: GameRoundService,
	) { }

	public async publishAndRateImage(gameId: string, player: Player, imageBase64: string, forRound: number): Promise<Image> {
		try {
			const timeToPublish = await this.getTimeToPublish(gameId, forRound);
			//implement base64 image upload to S3 and Rekognition request here//
			const fakeRating = 420;
			const image = new Image('123', new Date().getTime(), '127.0.0.1', player, forRound, this.imageRating(fakeRating, timeToPublish));
			await this.addImage(gameId, image);
			return image;
		} catch (err) {
			throw new Error('Error while rating and adding image.');
		}
	}

	private imageRating(rekognitionPoints: number, timeToPublish: number): number {
		return Math.floor(rekognitionPoints / timeToPublish);
	}

	private async getTimeToPublish(gameId: string, round: number): Promise<number> {
		const currentTime = new Date().getTime();
		const roundStartedEvents = await this.gameRoundService.getGameEvents(gameId, GameEvents.ROUND_STARTED) as NewGameRoundEvent[];
		const event = roundStartedEvents.find(event => event.round === round);
		return currentTime - event.createdAt;
	}

	private async addImage(gameId: string, image: Image): Promise<void> {
		try {
			await this.gameRoundService.pubGameEvent(gameId, new GameImageAddedEvent(gameId, image));
		} catch (err) {
			throw new Error('Could not add image to set.');
		}
	}

	public async getImages(gameId: string, round?: number, playerId?: string): Promise<Image[]> {
		try {
			const imageAddedEvents = await this.gameRoundService.getGameEvents(gameId, GameEvents.IMAGE_ADDED) as GameImageAddedEvent[];
			const images = imageAddedEvents.map(imageAddedEvent => imageAddedEvent.image);
			if (round && playerId) {
				return images.filter(image => image.getRound() === round && image.player.id === playerId);
			} else if (round) {
				return images.filter(image => image.getRound() === round);
			} else if (playerId) {
				return images.filter(image => image.player.id === playerId);
			} else {
				return images;
			}
		} catch (err) {
			throw new Error('Error while retrieving images from set.');
		}
	}
}
