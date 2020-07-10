import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { sleepRange, HOUR_IN_SECONDS, sleep } from '../../../shared/helper';
import { Observable } from 'rxjs';
import { PubSubService, KeyValueService, LockService } from '../../../shared/redis';
import { Lobby } from '../../lobby/models';
import { Game, GameStartedEvent, Image, NewGameRoundEvent, GameImagesShouldPublishEvent, GameRoundOverEvent, GameOverEvent, GameImageAddedEvent, GameEvent, GameEvents } from '../models';

const ACTIVE_GAMES = 'ACTIVE_GAMES';
const GAME = 'game:';
const IMAGES = 'images:';

@Injectable()
export class GameRoundService {
	private readonly WAIT_TIME_TO_GAME_START = this.SECOND_IN_MILLISECONDS * 10;
	private readonly WAIT_TIME_BETWEEN_ROUND = this.SECOND_IN_MILLISECONDS * 2;
	private readonly WAIT_UNTIL_IMAGE_IS_PUBLISHED = this.SECOND_IN_MILLISECONDS * 5;

	constructor(
		private readonly pubSubService: PubSubService,
		private readonly keyValueService: KeyValueService,
		private readonly lockService: LockService,
		@Inject('SECOND_IN_MILLISECONDS') private readonly SECOND_IN_MILLISECONDS: number,
	) { }

	public async initGame(lobby: Lobby, duration: number, rounds: number): Promise<[Game, Observable<GameEvent>]> {
		const id = uuidv4();
		try {
			const game = new Game(id, new Date().getTime(), lobby.getPlayers(), duration * this.SECOND_IN_MILLISECONDS, rounds);
			await this.setGame(id, game);
			setTimeout(() => this.startGameLoop(game));
			const events = this.pubSubService.onChannelPub<GameEvent>(id);
			return [game, events];
		} catch (err) {
			throw new Error('Failed to init Game');
		}
	}

	private async startGameLoop(game: Game): Promise<void> {
		try {
			await sleep(this.WAIT_TIME_TO_GAME_START);
			await this.pubGameEvent(game.id, new GameStartedEvent(game));
			await sleep(this.WAIT_TIME_BETWEEN_ROUND);
			await this.pubGameEvent(game.id, new NewGameRoundEvent(game, 1, new Date().getTime()));
			const roundDuration = (game.durationRound < this.WAIT_UNTIL_IMAGE_IS_PUBLISHED) ?  game.durationRound : game.durationRound - this.WAIT_UNTIL_IMAGE_IS_PUBLISHED;
			for await (const roundIndex of sleepRange(1, game.rounds, roundDuration)) {
				await this.pubGameEvent(game.id, new GameImagesShouldPublishEvent(game));
				await sleep(this.WAIT_UNTIL_IMAGE_IS_PUBLISHED);
				await this.pubGameEvent(game.id, new GameRoundOverEvent(game, roundIndex, await this.getImages(game.id, roundIndex)));
				await sleep(this.WAIT_TIME_BETWEEN_ROUND);
				const newRoundIndex = roundIndex + 1;
				if (newRoundIndex <= game.rounds) {
					await this.pubGameEvent(game.id, new NewGameRoundEvent(game, newRoundIndex, new Date().getTime()));
				}
			}
			await this.pubGameEvent(game.id, new GameOverEvent(game, game.decideWinner(), await this.getImages(game.id)));
		} catch (err) {
			throw new Error('Error in the gameloop.');
		}
	}

	private async pubGameEvent(gameId: string, event: GameEvent): Promise<void> {
		try {
			await this.pubSubService.pubToChannel<GameEvent>(gameId, event);
		} catch (err) {
			throw new Error('Could not publish LobbyEvent.');
		}
	}

	private async setGame(gameId: string, game: Game): Promise<void> {
		try {
			await this.keyValueService.set<Game>(GAME + gameId, game, game.duration + HOUR_IN_SECONDS);
		} catch (err) {
			throw new Error('Could not set Game.');
		}
	}

	public async deleteGame(gameId: string): Promise<void> {
		try {
			await Promise.all([this.keyValueService.delete(GAME + gameId), this.pubSubService.deleteChannelHistory(gameId)]);
		} catch (err) {
			//throw new Error('Could not delete Game.');
		}
	}

	public async getGameEvents(gameId: string, eventType?: GameEvents): Promise<GameEvent[]> {
		try {
			const gameEvents = await this.pubSubService.getChannelHistory<GameEvent>(gameId);
			return (eventType) ? gameEvents.filter(gameEvent => gameEvent.getType() === eventType) : gameEvents;
		} catch (err) {
			throw new Error('Could not retrieve eventhistory for given id.');
		}
	}

	public async getGame(gameId: string): Promise<Game> {
		try {
			return await this.keyValueService.get<Game>(GAME + gameId);
		} catch (err) {
			throw new Error('Game not found.');
		}
	}

	public async addImage(gameId: string, image: Image): Promise<void> {
		try {
			await this.keyValueService.addToSet<Image>(IMAGES + gameId, image);
			await this.pubGameEvent(gameId, new GameImageAddedEvent(gameId, image));
		} catch (err) {
			throw new Error('Could not add image to set.');
		}
	}

	public async getImages(gameId: string, round?: number, playerId?: string): Promise<Image[]> {
		try {
			const images = await this.keyValueService.getSet<Image>(IMAGES + gameId);
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
