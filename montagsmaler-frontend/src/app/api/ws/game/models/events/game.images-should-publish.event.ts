import { GameEvent } from '../game.event';
import { IGame } from '../game';

export interface GameImagesShouldPublishEvent extends GameEvent {
  readonly id: number;
  readonly game: IGame;
}
