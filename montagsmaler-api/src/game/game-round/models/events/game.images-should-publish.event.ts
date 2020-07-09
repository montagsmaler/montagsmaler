import { GameEvent } from '../game.event';
import { JSONSerializable } from '../../../../shared/serializable';
import { Game } from '../game';
import { Player } from '../../../lobby/models/player';
import { GameEvents } from '..';

@JSONSerializable()
export class GameImagesShouldPublishEvent implements GameEvent {
  constructor(private readonly game: Game) {}

  public getTrigger(): 'GAME' | Player {
    return 'GAME';
	}
	
  public getMessage(): string {
    return `Images should be published now.`;
	}
	
	public getType(): GameEvents {
		return GameEvents.IMAGES_SHOULD_PUBLISH;
	}
}