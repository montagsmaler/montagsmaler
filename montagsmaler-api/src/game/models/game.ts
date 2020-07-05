import { Lobby } from './lobby';
import { JSONSerializable } from '../../shared/serializable';

@JSONSerializable()
export class Game {
	private readonly scores: Record<string, number> = {};

	constructor(
		public readonly id: string,
		public readonly createdAt: number,
		public readonly lobby: Lobby,
		public readonly durationRound: number,
		public readonly rounds: number,
	) { }

	public get duration() {
		return this.durationRound * this.rounds;
	}

	public decideWinner(): Record<string, number>[] {
		const retArr = [];
		for (const key in this.scores) {
			retArr.push({ player: key, score: this.scores[key] });
		}
		return retArr.sort((a, b) => (a > b) ? 1 : -1);
	}
}
