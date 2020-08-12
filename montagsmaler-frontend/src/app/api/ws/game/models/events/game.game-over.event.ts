import { GameEvent } from '../game.event';
import { IGame } from '../game';
import { Player } from '../../../lobby/models';
import { GameImage } from '../game.image';

export interface GameOverEvent extends GameEvent {
  readonly id: number;
  readonly game: IGame;
  readonly scoreboard: { player: Player, score: number }[];
  readonly images: GameImage[];
}
