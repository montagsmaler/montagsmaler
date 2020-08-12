import { GameImage } from '../game.image';
import { GameEvent } from '../game.event';

export interface GameImageAddedEvent extends GameEvent {
  readonly id: number;
  readonly gameId: string;
  readonly image: GameImage;
}
