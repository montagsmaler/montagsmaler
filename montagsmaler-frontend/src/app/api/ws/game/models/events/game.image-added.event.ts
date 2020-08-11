import { GameImage } from '../game.image';
import { GameEvent } from '../game.event';

export class GameImageAddedEvent implements GameEvent {
  constructor(
    public readonly id: number,
    public readonly gameId: string,
    public readonly image: GameImage,
  ) { }
}
