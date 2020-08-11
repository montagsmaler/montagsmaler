import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { IdService } from '../../../shared/redis';
import { GameImageAddedEvent, GameEvents, NewGameRoundEvent } from '../../../game/game-round/models';
import { Image } from '../models';
import { GameRoundService } from '../../../game/game-round/service/game-round.service';
import { Player } from '../../lobby/models';
import { S3Service } from '../../../api/http/s3';
import { RecognitionService } from '../../../api/http/recognition';
import { ConfigService } from '@nestjs/config'

const CONTENT_ENCODING = 'base64';
const CONTENT_TYPE = 'image/png';
const FILE_EXT = 'png';

@Injectable()
export class ImageService {

	private readonly bucket: string = this.configService.get('AWS_S3_BUCKET');

	constructor(
		private readonly idService: IdService,
		@Inject(forwardRef(() => GameRoundService)) private readonly gameRoundService: GameRoundService,
		private readonly s3Service: S3Service,
		private readonly rekognitionService: RecognitionService,
		private readonly configService: ConfigService,
	) { }

	public async publishAndRateImage(gameId: string, player: Player, imageBase64: string, forRound: number): Promise<Image> {
		try {
			const [timeToPublish, noun] = await this.getTimeToPublishAndNoun(gameId, forRound);
			const uuid = this.idService.getUUID();
			const imageS3 = await this.s3Service.upload(
				{ 
					Bucket: this.bucket,
					Key: `${uuid}.${FILE_EXT}`,
					Body: imageBase64, 
					ContentEncoding: CONTENT_ENCODING,
					ContentType: CONTENT_TYPE,
				}
			);
			const labels = (await this.rekognitionService.recognize(
				{
					Bucket: this.bucket,
					Name: imageS3.Key,
				}
			)).Labels;

			let confidence = 0;
			
			if (labels) {
				const expectedLabel = labels.find(label => label.Name === noun);
				if (expectedLabel) {
					confidence = expectedLabel.Confidence;
				}
			}

			const image = new Image(uuid, new Date().getTime(), imageS3.Location, player, forRound, this.imageRating(confidence, timeToPublish));
			await this.addImage(gameId, image);
			return image;
		} catch (err) {
			throw new Error('Error while rating and adding image.');
		}
	}

	private imageRating(rekognitionConfidence: number, timeToPublish: number): number {
		return Math.floor((rekognitionConfidence * 1000) / timeToPublish);
	}

	private async getTimeToPublishAndNoun(gameId: string, round: number): Promise<[number, string]> {
		const currentTime = new Date().getTime();
		const roundStartedEvents = await this.gameRoundService.getGameEvents(gameId, GameEvents.ROUND_STARTED) as NewGameRoundEvent[];
		const event = roundStartedEvents.find(event => event.round === round);
		return [currentTime - event.createdAt, event.noun];
	}

	private async addImage(gameId: string, image: Image): Promise<void> {
		try {
			await this.gameRoundService.pubGameEvent(gameId, new GameImageAddedEvent(await this.idService.getIncrementalID(), gameId, image));
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
