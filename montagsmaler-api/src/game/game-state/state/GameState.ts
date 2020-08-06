import { GameStateContext } from './GameStateContext';

export interface IStateAccepted {
	currentState: string,
	accepted: boolean,
}

export interface IGameState {
	startGame(): IStateAccepted;
	endGame(): IStateAccepted;
	startRound(): IStateAccepted;
	endRound(): IStateAccepted;
	publishImage(playerId: string, forRound: number): IStateAccepted;
	imagesShouldBePublished(): IStateAccepted;
	getCurrentState(): string;
}

export abstract class GameState implements IGameState {

	constructor(protected readonly context: GameStateContext) { }

	abstract startGame(): IStateAccepted;
	abstract endGame(): IStateAccepted;
	abstract startRound(): IStateAccepted;
	abstract endRound(): IStateAccepted;
	abstract publishImage(playerId: string, forRound: number): IStateAccepted;
	abstract imagesShouldBePublished(): IStateAccepted;

	protected getStateAccepted(accepted: boolean): IStateAccepted {
		return { currentState: this.getCurrentState(), accepted: accepted };
	}

	public getCurrentState(): string {
		return this.constructor.name;
	}
}