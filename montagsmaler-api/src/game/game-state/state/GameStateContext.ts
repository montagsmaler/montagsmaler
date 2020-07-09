import { IGameState, IStateAccepted } from './GameState';
import { JSONSerializable, Class } from '../../../shared/serializable';
import { GameNotStarted } from './states/GameNotStarted';
import { Game } from '../../game-round/models';

@JSONSerializable()
export class GameStateContext implements IGameState {
	private _currentRound = 0;
	private readonly _rounds: number;
	private currentGameState: IGameState;
	private readonly playerSubmissions: Record<string, Record<number, boolean | undefined>> = {};

	constructor(game: Game) {
		this._rounds = game.rounds;
		for (const player of game.players) {
			this.playerSubmissions[player.id] = {};
		}
		this.setState(GameNotStarted);
	}

	public setState(StateClass: Class<IGameState>): void {
		this.currentGameState = new StateClass(this);
	}

	public addSubmission(playerId: string, round: number): void {
		this.playerSubmissions[playerId][round] = true;
	}

	public hasSubmitted(playerId: string, round: number): boolean | undefined {
		return (this.playerSubmissions[playerId]) ? this.playerSubmissions[playerId][round] : true;
	}

	public get currentRound(): number {
		return this._currentRound;
	}

	public get maxRound(): number {
		return this._rounds;
	}

	private incrementRound(): void {
		this._currentRound += 1;
	}

	public startGame(): IStateAccepted {
		return this.currentGameState.startGame();
	}

	public endGame(): IStateAccepted {
		return this.currentGameState.endGame();
	}

	public startRound(): IStateAccepted {
		const stateAccepted = this.currentGameState.startRound();
		if (stateAccepted.accepted) {
			this.incrementRound();
		}
		return stateAccepted;
	}

	public endRound(): IStateAccepted {
		return this.currentGameState.endRound();
	}

	public publishImage(playerId: string, forRound: number): IStateAccepted {
		return this.currentGameState.publishImage(playerId, forRound);
	}

	public imagesShouldBePublished(): IStateAccepted {
		return this.currentGameState.imagesShouldBePublished();
	}

	public getCurrentState(): string {
		return this.currentGameState.getCurrentState();
	}
}