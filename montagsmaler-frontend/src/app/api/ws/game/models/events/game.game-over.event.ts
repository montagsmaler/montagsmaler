import { GameEvent } from '../game.event';
import { Game } from '../game';
import { Player } from '../../../lobby/models';
import { GameImage } from '../game.image';

export class GameOverEvent implements GameEvent {
  constructor(
    public readonly id: number,
    public readonly game: Game,
    public readonly scoreboard: { player: Player, score: number }[],
    public readonly images: GameImage[],
  ) { }

}
