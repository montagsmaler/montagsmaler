import { Injectable } from '@nestjs/common';
import { GameStateContext } from '../state/GameStateContext';
import { IStateAccepted } from '../state/GameState';
import { GameRoundService } from '../../game-round/service/game-round.service';
import { GameEvents, GameImageAddedEvent } from '../../game-round/models';

@Injectable()
export class GameStateService {

	constructor(
		private readonly gameRoundService: GameRoundService,
	) { }

	public async canPublishImage(gameId: string, playerId: string, forRound: number): Promise<IStateAccepted> {
		try {
			const gameState = await this.getGameStateContext(gameId);
			return gameState.publishImage(playerId, forRound);
		} catch (err) {
			throw err;
		}
	}

	public async getGameStateAsString(gameId: string): Promise<string> {
		return (await this.getGameStateContext(gameId)).getCurrentState();
	}

	public async getGameStateContext(gameId: string): Promise<GameStateContext> {
		try {
			const [game, events] = await Promise.all([this.gameRoundService.getGame(gameId), this.gameRoundService.getGameEvents(gameId)]);
			if (events.length <= 0) throw new Error('Game not found.');
			return events.reduce((stateContext, event) => {
				switch (event.getType()) {
					case GameEvents.GAME_STARTED:
						stateContext.startGame();
						break;
					case GameEvents.GAME_OVER:
						stateContext.endGame();
						break;
					case GameEvents.ROUND_STARTED:
						stateContext.startRound();
						break;
					case GameEvents.ROUND_OVER:
						stateContext.endRound();
						break;
					case GameEvents.IMAGES_SHOULD_PUBLISH:
						stateContext.imagesShouldBePublished();
						break;
					case GameEvents.IMAGE_ADDED:
						stateContext.publishImage((event as GameImageAddedEvent).image.player.id, (event as GameImageAddedEvent).image.round);
						break;
					default:
						break;
				}
				return stateContext;
			}, new GameStateContext(game));
		} catch (err) {
			throw new Error('Could not retrieve GameState.');
		}
	}

}
