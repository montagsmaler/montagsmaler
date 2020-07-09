import { GameStateContext } from './GameStateContext';

export interface IGameState {
	startGame(): boolean;
	endGame(): boolean;
	startRound(): boolean;
	endRound(): boolean;
	publishImage(playerId: string, forRound: number): boolean;
	imagesShouldBePublished(): boolean;
}

export abstract class GameState implements IGameState {

	constructor(protected readonly context: GameStateContext) { }

	abstract startGame(): boolean;
	abstract endGame(): boolean;
	abstract startRound(): boolean;
	abstract endRound(): boolean;
	abstract publishImage(playerId: string, forRound: number): boolean;
	abstract imagesShouldBePublished(): boolean;
}