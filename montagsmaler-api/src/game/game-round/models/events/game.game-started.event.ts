import { GameEvent } from '../game.event';
import { JSONSerializable } from '../../../../shared/serializable';
import { Game } from '../game';
import { Player } from '../../../lobby/models/player';
import { CreatedAt } from '../../../../shared/helper';
import { GameEvents } from '../game.events';

//@CreatedAt()
@JSONSerializable()
export class GameStartedEvent implements GameEvent {
  constructor(private readonly game: Game) {}

  public getTrigger(): 'GAME' | Player {
    return 'GAME';
	}
	
  public getMessage(): string {
    return `Game "${this.game.id}" is over.`;
	}
	
	public getType(): GameEvents {
		return GameEvents.GAME_STARTED;
	}
}
