import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { sleepRange, HOUR_IN_SECONDS, sleep } from '../../../shared/helper';
import { Observable } from 'rxjs';
import { PubSubService, KeyValueService, LockService, IdService } from '../../../shared/redis';
import { Lobby } from '../../lobby/models';
import { Game, GameStartedEvent, NewGameRoundEvent, GameImagesShouldPublishEvent, GameRoundOverEvent, GameOverEvent, GameEvent, GameEvents } from '../models';
import { ImageService } from '../../image/service/image.service';
import { takeWhile } from 'rxjs/internal/operators';
import { RekognitionNounService } from '../../rekognition-noun';

const ACTIVE_GAMES = 'ACTIVE_GAMES';
const GAME = 'game:';

@Injectable()
export class GameRoundService {
	private readonly WAIT_TIME_TO_GAME_START = this.SECOND_IN_MILLISECONDS * 10;
	private readonly WAIT_TIME_BETWEEN_ROUND = this.SECOND_IN_MILLISECONDS * 2;
	private readonly WAIT_UNTIL_IMAGE_IS_PUBLISHED = this.SECOND_IN_MILLISECONDS * 5;

	constructor(
		private readonly pubSubService: PubSubService,
		private readonly keyValueService: KeyValueService,
		private readonly idService: IdService,
		private readonly nounService: RekognitionNounService,
		@Inject(forwardRef(() => ImageService)) private readonly imageService: ImageService,
		private readonly lockService: LockService,
		@Inject('SECOND_IN_MILLISECONDS') private readonly SECOND_IN_MILLISECONDS: number,
	) { }

	public async initGame(lobby: Lobby, duration: number, rounds: number): Promise<[Game, Observable<GameEvent>]> {
		const id = this.idService.getUUID();
		try {
			const game = new Game(id, new Date().getTime(), lobby.getPlayers(), duration * this.SECOND_IN_MILLISECONDS, rounds);
			await this.setGame(id, game);
			setTimeout(() => this.startGameLoop(game));
			const events = this.onGameEvent(id);
			return [game, events];
		} catch (err) {
			throw new Error('Failed to init Game');
		}
	}

	public async joinGame(gameId: string, playerId: string): Promise<[Game, Observable<GameEvent>]> {
		const game = await this.getGame(gameId);
		if (!game) throw new Error('Game does not exist.');
		if (!game.isPlayerMember(playerId)) throw new Error('Player is not member of the game.');
		return [game, this.onGameEvent(gameId)];
	}

	private async startGameLoop(game: Game): Promise<void> {
		try {
			await sleep(this.WAIT_TIME_TO_GAME_START);
			await this.pubGameEvent(game.id, new GameStartedEvent(await this.idService.getIncrementalID(), game));
			await sleep(this.WAIT_TIME_BETWEEN_ROUND);
			await this.pubGameEvent(game.id, new NewGameRoundEvent(await this.idService.getIncrementalID(), game, this.nounService.next(), 1, new Date().getTime()));
			const roundDuration = (game.durationRound < this.WAIT_UNTIL_IMAGE_IS_PUBLISHED) ? game.durationRound : game.durationRound - this.WAIT_UNTIL_IMAGE_IS_PUBLISHED;
			for await (const roundIndex of sleepRange(1, game.rounds, roundDuration)) {
				await this.pubGameEvent(game.id, new GameImagesShouldPublishEvent(await this.idService.getIncrementalID(), game));
				await sleep(this.WAIT_UNTIL_IMAGE_IS_PUBLISHED);
				await this.pubGameEvent(game.id, new GameRoundOverEvent(await this.idService.getIncrementalID(), game, roundIndex, await this.imageService.getImages(game.id, roundIndex)));
				await sleep(this.WAIT_TIME_BETWEEN_ROUND);
				const newRoundIndex = roundIndex + 1;
				if (newRoundIndex <= game.rounds) {
					await this.pubGameEvent(game.id, new NewGameRoundEvent(await this.idService.getIncrementalID(), game, this.nounService.next(), newRoundIndex, new Date().getTime()));
				}
			}
			await this.pubGameEvent(game.id, new GameOverEvent(await this.idService.getIncrementalID(), game, game.decideWinner(), await this.imageService.getImages(game.id)));
		} catch (err) {
			throw new Error('Error in the gameloop.');
		}
	}

	private onGameEvent(gameId: string): Observable<GameEvent> {
		return this.pubSubService.onChannelPub<GameEvent>(gameId).pipe(takeWhile(gameEvent => gameEvent.getType() !== GameEvents.GAME_OVER, true));
	}

	public async pubGameEvent(gameId: string, event: GameEvent): Promise<void> {
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
}
