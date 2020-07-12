import { LobbyEvent } from '../lobby.event';
import { Player } from  '../player';
import { JSONSerializable } from '../../../../shared/serializable';
import { LobbyEvents } from '../lobby.events';

@JSONSerializable()
export class LobbyPlayerLeftEvent implements LobbyEvent {

	constructor(public readonly id: number, private readonly player: Player) { }

	public getTrigger(): Player {
		return this.player;
	}

	public getMessage(): string {
		return `Player ${this.player.name} left the lobby.`;
	}

	public getType(): LobbyEvents {
		return LobbyEvents.PLAYER_LEFT;
	}
}