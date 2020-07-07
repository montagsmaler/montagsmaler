import { Injectable, Inject } from '@nestjs/common';
import { Lobby, Game, GameEvent, NewGameRoundEvent, Image, GameStartedEvent, GameOverEvent, GameRoundOverEvent } from '../../models';
import { v4 as uuidv4 } from 'uuid';
import { sleepRange, HOUR_IN_SECONDS, sleep } from '../../../shared/helper';
import { Observable } from 'rxjs';
import { PubSubService, KeyValueService, LockService } from '../../../shared/redis';
import { GameStateService } from '../../game-state';

const ACTIVE_GAMES = 'ACTIVE_GAMES';
const GAME = 'game:';
const IMAGES = 'images:';

@Injectable()
export class GameRoundService {
	private readonly WAIT_TIME_TO_GAME_START = this.SECOND_IN_MILLISECONDS * 10;
	private readonly WAIT_TIME_BETWEEN_ROUND = this.SECOND_IN_MILLISECONDS * 2;

	constructor(
		private readonly pubSubService: PubSubService,
		private readonly keyValueService: KeyValueService,
		private readonly lockService: LockService,
		private readonly gameStateService: GameStateService,
		@Inject('SECOND_IN_MILLISECONDS') private readonly SECOND_IN_MILLISECONDS: number,
	) { }

	public async initGame(lobby: Lobby, duration: number, rounds: number): Promise<[Game, Observable<GameEvent>]> {
		const id = uuidv4();
		try {
			const game = new Game(id, new Date().getTime(), lobby.getPlayers(), duration, rounds);
			await this.setGame(id, game);
			this.startGameLoop(game);
			const events = this.pubSubService.onChannelPub<GameEvent>(id);
			await this.gameStateService.registerGame(game, events);
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
			await this.pubGameEvent(game.id, new NewGameRoundEvent(game, 1));
			for await (const roundIndex of sleepRange(1, game.rounds, game.durationRound)) {
				await this.pubGameEvent(game.id, new GameRoundOverEvent(game, roundIndex, await this.getImages(game.id, roundIndex)));
				await sleep(this.WAIT_TIME_BETWEEN_ROUND);
				const newRoundIndex = roundIndex + 1;
				if (newRoundIndex <= game.rounds) {
					await this.pubGameEvent(game.id, new NewGameRoundEvent(game, newRoundIndex));
				}
			}
			await this.pubGameEvent(game.id, new GameOverEvent(game, game.decideWinner()));
		} catch (err) {
			throw new Error('Error in the gameloop.');
		}
	}

	private async pubGameEvent(id: string, event: GameEvent): Promise<void> {
		try {
			await this.pubSubService.pubToChannel<GameEvent>(id, event);
		} catch (err) {
			throw new Error('Could not publish LobbyEvent.');
		}
	}

	private async setGame(gameId: string, game: Game): Promise<void> {
		try {
			await this.keyValueService.set<Game>(GAME + gameId, game, game.duration * 1000 + HOUR_IN_SECONDS);
		} catch (err) {
			throw new Error('Could not set Game.');
		}
	}

	public async getGameEvents(gameId: string): Promise<GameEvent[]> {
		try {
			return await this.pubSubService.getChannelHistory<GameEvent>(gameId);
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

	private async addImage(gameId: string, image: Image): Promise<void> {
		try {
			await this.keyValueService.addToSet<Image>(IMAGES + gameId, image);
		} catch (err) {
			throw new Error('Could not add image to set.');
		}
	}

	private async getImages(gameId: string, round?: number): Promise<Image[]> {
		try {
			const images = await this.keyValueService.getSet<Image>(IMAGES + gameId);
			return (round) ? images.filter(image => image.round === round) : images;
		} catch (err) {
			throw new Error('Error while retrieving images from set.');
		}
	}
}
