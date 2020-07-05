import { GameRoundEvent } from './game-round.event';
import { JSONSerializable } from '../../shared/serializable';
import { GameRound } from './game-round';

@JSONSerializable()
export class NewGameRound implements GameRoundEvent {
  constructor(private readonly game: GameRound) {}

  public getTrigger(): GameRound {
    return this.game;
  }

  public getMessage(): string {
    return `New Round begins`;
  }
}
