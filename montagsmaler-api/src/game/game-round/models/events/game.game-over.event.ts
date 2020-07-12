import { GameEvent } from '../game.event';
import { JSONSerializable } from '../../../../shared/serializable';
import { Game } from '../game';
import { Player } from '../../../lobby/models/player'
import { GameEvents } from '../game.events';
import { Image } from '../../../image/models/image';

//@CreatedAt()
@JSONSerializable()
export class GameOverEvent implements GameEvent {
  constructor(public readonly id: number, private readonly game: Game, public readonly winner: {player: Player, score: number}[], public readonly images: Image[]) {}

  public getTrigger(): 'GAME' | Player {
    return 'GAME';
  }

  public getMessage(): string {
    return `Game "${this.game.id}" is over.`;
	}
	
	public getType(): GameEvents {
		return GameEvents.GAME_OVER;
	}
}
