import { Player } from './player';
import { Game } from './game';
import { JSONSerializable } from '../../shared/serializable';

export const LOBBY_MAX_SIZE = 5;

@JSONSerializable()
export class Lobby {
	constructor(
		public readonly id: string,
		public readonly createdAt: number,
		private members: Player[],
	) { }

	public addPlayer(player: Player): void {
		if (this.playerCount() > LOBBY_MAX_SIZE)
			throw new Error(
				`Can not add player "${player.id}" to lobby since it is already full. Maximum players per lobby ${LOBBY_MAX_SIZE}.`,
			);
		if (!this.isPlayerMember(player)) {
			this.members.push(player);
		}
	}

	public isPlayerMember(playerMember: Player): boolean {
		return !(
			this.members.findIndex(player => player.id === playerMember.id) === -1
		);
	}

	public removePlayer(playerRemove: Player): void {
		this.members = this.members.filter(player => player.id !== playerRemove.id);
	}

	public playerCount(): number {
		return this.members.length;
	}
}
