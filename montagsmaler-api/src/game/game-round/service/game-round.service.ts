import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { sleepRange, HOUR_IN_SECONDS, sleep } from '../../../shared/helper';
import { Observable } from 'rxjs';
import { PubSubService, KeyValueService, IdService, LockService } from '../../../shared/redis';
import { Lobby, Player } from '../../lobby/models';
import { Game, GameStartedEvent, NewGameRoundEvent, GameImagesShouldPublishEvent, GameRoundOverEvent, GameOverEvent, GameEvent, GameEvents, GameImageAddedEvent } from '../models';
import { ImageService } from '../../image/service/image.service';
import { takeWhile } from 'rxjs/internal/operators';
import { RekognitionNounService } from '../../rekognition-noun';
import { Lock } from 'redlock';

const GAME = 'game:';
const PLAYER = 'player:';

@Injectable()
export class GameRoundService {
	private readonly WAIT_TIME_TO_GAME_START = this.SECOND_IN_MILLISECONDS * 3;
	private readonly WAIT_TIME_BETWEEN_ROUND = this.SECOND_IN_MILLISECONDS * 3;
	private readonly WAIT_UNTIL_IMAGE_IS_PUBLISHED = this.SECOND_IN_MILLISECONDS * 5;
	private readonly WAIT_TO_DELETE_GAME = this.SECOND_IN_MILLISECONDS * 60;

	constructor(
		private readonly pubSubService: PubSubService,
		private readonly keyValueService: KeyValueService,
		private readonly idService: IdService,
		private readonly nounService: RekognitionNounService,
		private readonly lockService: LockService,
		@Inject(forwardRef(() => ImageService)) private readonly imageService: ImageService,
		@Inject('SECOND_IN_MILLISECONDS') private readonly SECOND_IN_MILLISECONDS: number,
	) { }

	public async initGame(player: Player, lobby: Lobby, duration: number, rounds: number): Promise<[Game, Observable<GameEvent>]> {
		const id = this.idService.getUUID();
		try {
            const game = new Game(id, new Date().getTime(), lobby.getPlayers(), duration * this.SECOND_IN_MILLISECONDS, rounds);
            const playerRunningGames = await this.keyValueService.getInt(GAME + PLAYER + player.id);
            if (playerRunningGames > 0) {
                throw new Error('Player already has a running game.');
            } else {
                await this.keyValueService.setInt(GAME + PLAYER + player.id, playerRunningGames + 1, this.WAIT_TIME_BETWEEN_ROUND + this.WAIT_TIME_TO_GAME_START + game.duration + 10_000)
            }
			await this.setGame(id, game);
			setTimeout(() => this.startGameLoop(game, player.id));
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

	private async startGameLoop(game: Game, playerId: string): Promise<void> {
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
				const newRoundIndex = roundIndex + 1;
				if (newRoundIndex <= game.rounds) {
					await sleep(this.WAIT_TIME_BETWEEN_ROUND);
					await this.pubGameEvent(game.id, new NewGameRoundEvent(await this.idService.getIncrementalID(), game, this.nounService.next(), newRoundIndex, new Date().getTime()));
				}
            }
			const [id, scoreboard, images] = await Promise.all([this.idService.getIncrementalID(), this.getScoreboard(game.id), this.imageService.getImages(game.id)]);
            await this.pubGameEvent(game.id, new GameOverEvent(id, game, scoreboard, images));
            try {
                await this.keyValueService.delete(GAME + PLAYER + playerId);
            } catch (err) { }
			await sleep(this.WAIT_TO_DELETE_GAME);
			await this.deleteGame(game.id);
		} catch (err) {
			try {
                await this.keyValueService.delete(GAME + PLAYER + playerId);
            } catch (err) { }
			throw new Error('Error in the gameloop.');
		}
	}

	public async getScoreboard(gameId: string): Promise<{ player: Player, score: number }[]> {
		const events = await this.getGameEvents(gameId, GameEvents.IMAGE_ADDED) as GameImageAddedEvent[];
		return Array.from(
			events
				.reduce((playerScores, event) => {
					let currentScore = playerScores.get(event.image.player.id);
					if (!currentScore) {
						currentScore = { player: event.image.player, score: event.image.score };
					} else {
						currentScore.score += event.image.score;
					}
					playerScores.set(event.image.player.id, currentScore);
					return playerScores;
				}, new Map<string, { player: Player, score: number }>())
				.values()
		)
			.sort((a, b) => (a.score > b.score) ? 1 : -1);
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
