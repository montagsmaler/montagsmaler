import { GameEvent } from '../game.event';
import { IGame } from '../game';
import { GameImage } from '../game.image';

export interface GameRoundOverEvent extends GameEvent {
  readonly id: number;
  readonly game: IGame;
  readonly round: number;
  readonly imageSubmissions: GameImage[];
}
