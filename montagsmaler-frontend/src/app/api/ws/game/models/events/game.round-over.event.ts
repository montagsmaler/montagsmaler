import { GameEvent } from '../game.event';
import { Game } from '../game';
import { GameImage } from '../game.image';

export class GameRoundOverEvent implements GameEvent {

  constructor(
    public readonly id: number,
    public readonly game: Game,
    public readonly round: number,
    public readonly imageSubmissions: GameImage[],
  ) { }

}
