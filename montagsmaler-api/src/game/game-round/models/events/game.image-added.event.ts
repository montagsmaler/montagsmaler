import { GameEvents,  GameEvent, Image} from '../';
import { Player } from '../../../lobby/models';

export class GameImageAddedEvent implements GameEvent {

	constructor(public readonly id: number, public readonly gameId: string, public readonly image: Image) { }
	
	getTrigger(): Player {
		return this.image.player;
	}
	getMessage(): string {
		return `New image by player ${this.image.player.id} was added.`;
	}
	getType(): GameEvents {
		return GameEvents.IMAGE_ADDED;
	}
}