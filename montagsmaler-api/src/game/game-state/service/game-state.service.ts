import { Injectable } from '@nestjs/common';
import { LockService, KeyValueService, PubSubService } from '../../../shared/redis';
import { GameStateContext } from '../state/GameStateContext';
import { Observable, Subscription, Subject } from 'rxjs';
import { filter, tap } from 'rxjs/internal/operators';
import { Lock } from 'redlock';
import { Game, GameEvents, GameEvent } from '../../game-round/models';
import { IStateAccepted } from '../state/GameState';
import { HOUR_IN_SECONDS } from '../../../shared/helper';

const GAME_STATE = 'gamestate:';
const GAME_STATE_MESSAGES = 'gamestatemessages:';

@Injectable()
export class GameStateService {

	private readonly subscriptions = new Map<string, Subscription>();
	private readonly stateAccepted = new Subject<{ gameId: string, eventType: GameEvents, stateAccepted: IStateAccepted }>();

	constructor(
		private readonly lockService: LockService,
		private readonly pubSubService: PubSubService,
		private readonly keyValueService: KeyValueService,
	) { }

	public async registerGame(game: Game, gameEvents: Observable<GameEvent>): Promise<Observable<{ eventType: GameEvents, stateAccepted: IStateAccepted }>> {
		await this.setGameState(game.id, new GameStateContext(game));
		const stateObservable = gameEvents
			.pipe(
				filter(event => event.getTrigger() === 'GAME'),
				tap(async gameLoopEvent => {
					const lock = await this.lockGameState(game.id);
					try {
						const gameState = await this.getGameState(game.id);
						let stateAccepted: IStateAccepted = { currentState: 'no current state', accepted: false };
						const eventType = gameLoopEvent.getType();
						switch (eventType) {
							case GameEvents.GAME_STARTED:
								stateAccepted = gameState.startGame();
								break;
							case GameEvents.GAME_OVER:
								stateAccepted = gameState.endGame();
								if (stateAccepted.accepted) {
									this.unsubscribeGameState(game.id);
								}
								break;
							case GameEvents.ROUND_STARTED:
								stateAccepted = gameState.startRound();
								break;
							case GameEvents.ROUND_OVER:
								stateAccepted = gameState.endRound();
								break;
							case GameEvents.IMAGES_SHOULD_PUBLISH:
								stateAccepted = gameState.imagesShouldBePublished();
							default:
								break;
						}
						await this.setGameState(game.id, gameState);
						this.stateAccepted.next({ gameId: game.id, eventType, stateAccepted });
					} catch (err) {
						this.unsubscribeGameState(game.id);
					} finally {
						await lock.unlock();
					}
				}),
			);
		this.subscriptions.set(game.id, stateObservable.subscribe());
		return this.stateAccepted.pipe(filter(stateAccepted => stateAccepted.gameId === game.id));
	}

	public async canPublishImage(gameId: string, playerId: string, forRound: number): Promise<IStateAccepted> {
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
			await this.keyValueService.set<GameStateContext>(GAME_STATE + gameId, stateContext, HOUR_IN_SECONDS);
		} catch (err) {
			throw new Error('Could not set GameState.');
		}
	}

}
