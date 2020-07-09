import { LobbyEvent } from '../lobby.event';
import { Player } from  '../player';
import { JSONSerializable } from '../../../../shared/serializable';
import { Game } from '../../../../game/game-round/models';
import { LobbyEvents } from '../lobby.events';

@JSONSerializable()
export class LobbyConsumedEvent implements LobbyEvent {

	constructor(private readonly player: Player, public readonly game: Game) { }
	
	public getType(): LobbyEvents {
		return LobbyEvents.CONSUMED;
	}

	public getTrigger(): Player {
		return this.player;
	}

	public getMessage(): string {
		return `Player ${this.player.name} joined the lobby.`;
	}
 
}