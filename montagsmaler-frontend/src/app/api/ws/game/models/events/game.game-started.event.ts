import { GameEvent } from '../game.event';
import { Game } from '../game';

export class GameStartedEvent implements GameEvent {
  constructor(public readonly id: number, public readonly game: Game) { }
}
