import { JSONSerializable } from '../../../shared/serializable';
import { Player } from '../../lobby/models';

@JSONSerializable()
export class Game {
	private readonly scores: Record<string, number> = {};

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

	public decideWinner(): { player: Player, score: number }[] {
		const retArr = [];
		for (const key in this.scores) {
			retArr.push({ player: this.players.find(player => player.id === key), score: this.scores[key] });
		}
		return retArr.sort((a, b) => (a.score > b.score) ? 1 : -1);
	}
}
