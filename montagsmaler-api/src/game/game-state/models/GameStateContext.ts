import { IGameState } from './GameState';
import { Game } from '../../../game/models';
import { JSONSerializable, Class } from '../../../shared/serializable';
import { GameNotStarted } from './states/GameNotStarted';

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
		return this.playerSubmissions[playerId][round];
	}

	public get currentRound(): number {
		return this._currentRound;
	}

	public get maxRound(): number {
		return this._rounds;
	}

	public incrementRound(): void {
		this._currentRound += 1;
	}

	public startGame(): boolean {
		return this.currentGameState.startGame();
	}
	
	public endGame(): boolean {
		return this.currentGameState.endGame();
	}
	
	public startRound(): boolean {
		return this.currentGameState.startRound();
	}
	
	public endRound(): boolean {
		return this.currentGameState.endRound();
	}
	
	public publishImage(playerId: string, forRound: number): boolean {
		return this.currentGameState.publishImage(playerId, forRound);
	}
}