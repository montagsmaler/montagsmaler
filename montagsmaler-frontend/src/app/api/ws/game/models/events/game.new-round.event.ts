import { IGame } from '../game';
import { GameEvent } from '../game.event';

export interface NewGameRoundEvent extends GameEvent {
  readonly id: number;
  readonly game: IGame;
  readonly noun: string;
  readonly round: number;
  readonly createdAt: number;
}
