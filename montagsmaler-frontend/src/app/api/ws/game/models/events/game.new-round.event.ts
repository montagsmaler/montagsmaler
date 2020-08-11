import { Game } from '../game';
import { GameEvent } from '../game.event';

export class NewGameRoundEvent implements GameEvent {

  constructor(
    public readonly id: number,
    public readonly game: Game,
    public readonly noun: string,
    public readonly round: number,
    public readonly createdAt: number,
  ) { }

}
