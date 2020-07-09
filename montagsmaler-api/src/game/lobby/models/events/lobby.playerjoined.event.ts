import { LobbyEvent } from '../lobby.event';
import { Player } from  '../player';
import { JSONSerializable } from '../../../../shared/serializable';

@JSONSerializable()
export class LobbyPlayerJoinedEvent implements LobbyEvent {

	constructor(private readonly player: Player) { }

	public getTrigger(): Player {
		return this.player;
	}

	public getMessage(): string {
		return `Player ${this.player.name} joined the lobby.`;
	}
}