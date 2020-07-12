import { JSONSerializable } from '../../../shared/serializable';
import { Player } from '../../lobby/models';

@JSONSerializable()
export class Game {

	constructor(
		public readonly id: string,
		public readonly createdAt: number,
		public readonly players: Player[],
		public readonly durationRound: number,
		public readonly rounds: number,
	) { }

	public get duration() {
		return this.durationRound * this.rounds;
	}

	public isPlayerMember(playerId: string): boolean {
    return this.players.findIndex(player => player.id === playerId) !== -1;
  }
}
