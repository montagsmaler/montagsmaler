import { Injectable } from '@nestjs/common';
import { LockService, KeyValueService, PubSubService } from '../../../shared/redis';
import { Game, GameEvent, GameEvents } from '../../../game/models';
import { GameStateContext } from '../models/GameStateContext';
import { Observable, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/internal/operators';
import { Lock } from 'redlock';

const GAME_STATE = 'gamestate:';
const GAME_STATE_MESSAGES = 'gamestatemessages:';

@Injectable()
export class GameStateService {

	private readonly subscriptions = new Map<string, Subscription>();

	constructor(
		private readonly lockService: LockService,
		private readonly pubSubService: PubSubService,
		private readonly keyValueService: KeyValueService,
	) { }

	public async registerGame(game: Game, gameEvents: Observable<GameEvent>): Promise<Observable<{ eventType: GameEvents, accepted: boolean }>> {
		await this.setGameState(game.id, new GameStateContext(game));
		const stateObservable = gameEvents
			.pipe(
				filter(event => event.getTrigger() === 'GAME'),
				switchMap(async gameLoopEvent => {
					const lock = await this.lockGameState(game.id);
					try {
						const gameState = await this.getGameState(game.id);
						let stateAccepted = false;
						const eventType = gameLoopEvent.getType();
						switch (eventType) {
							case GameEvents.GAME_STARTED:
								stateAccepted = gameState.startGame();
								break;
							case GameEvents.GAME_OVER:
								stateAccepted = gameState.endGame();
								break;
							case GameEvents.ROUND_STARTED:
								stateAccepted = gameState.startRound();
								break;
							case GameEvents.ROUND_OVER:
								stateAccepted = gameState.endRound();
								break;
							default:
								break;
						}
						await this.setGameState(game.id, gameState);
						return { eventType, accepted: stateAccepted };
					} catch (err) {
						this.unsubscribeGameState(game.id);
					} finally {
						await lock.unlock();
					}
				}),
			);
		this.subscriptions.set(game.id, stateObservable.subscribe());
		return stateObservable;
	}

	public async canPublishImage(gameId: string, playerId: string, forRound: number): Promise<boolean> {
		const lock = await this.lockGameState(gameId);
		try {
			const gameState = await this.getGameState(gameId);
			const canPublish = gameState.publishImage(playerId, forRound);
			await this.setGameState(gameId, gameState);
			return canPublish;
		} catch (err) {
			throw err;
		} finally {
			await lock.unlock();
		}
	}

	public async removeGameState(gameId: string): Promise<void> {
		try {
			this.unsubscribeGameState(gameId);
			await this.keyValueService.delete(GAME_STATE + gameId);
		} catch (err) {
			throw new Error('Could not remove game state.');
		}
	}

	public async pubMessage(message: string): Promise<void> {
		this.pubSubService.pubToChannel(GAME_STATE_MESSAGES, message);
	}

	public getMessages(): Observable<string> {
		return this.pubSubService.onChannelPub<string>(GAME_STATE_MESSAGES);
	}

	private unsubscribeGameState(gameId: string): void {
		const subscription = this.subscriptions.get(gameId);
		if (subscription) {
			subscription.unsubscribe();
			this.subscriptions.delete(gameId);
		}
	}

	private async lockGameState(gameId: string): Promise<Lock> {
		return await this.lockService.lockRessource(GAME_STATE + gameId);
	}

	private async getGameState(gameId: string): Promise<GameStateContext> {
		try {
			return await this.keyValueService.get<GameStateContext>(GAME_STATE + gameId);
		} catch (err) {
			throw new Error('Could not retrieve GameState.');
		}
	}

	private async setGameState(gameId: string, stateContext: GameStateContext): Promise<void> {
		try {
			await this.keyValueService.set<GameStateContext>(GAME_STATE + gameId, stateContext);
		} catch (err) {
			throw new Error('Could not set GameState.');
		}
	}

}
