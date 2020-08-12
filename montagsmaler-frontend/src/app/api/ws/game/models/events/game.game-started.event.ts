import { GameEvent } from '../game.event';
import { IGame } from '../game';

export interface GameStartedEvent extends GameEvent {
  readonly id: number;
  readonly game: IGame;
}
