import { GameEvent } from './game.event';
import { JSONSerializable } from '../../shared/serializable';
import { Game } from './game';
import { Player } from './player';
import { CreatedAt } from '../../shared/helper';
import { GameEvents } from './game.events';

//@CreatedAt()
@JSONSerializable()
export class GameOverEvent implements GameEvent {
  constructor(private readonly game: Game, public readonly winner) {}

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
