import { JSONSerializable } from '../../../../shared/serializable';
import { GameEvents, GameEvent, Game } from '../';
import { Player } from '../../../lobby/models';

@JSONSerializable()
export class NewGameRoundEvent implements GameEvent {

	constructor(
		public readonly id: number,
		public readonly game: Game,
		public readonly noun: string,
		public readonly round: number,
		public readonly createdAt: number,
	) { }

	public getTrigger(): 'GAME' | Player {
		return 'GAME';
	}

	public getMessage(): string {
		return `${this.round}/${this.game.rounds} round begins for game ${this.game.id}. New image submissions are allowed for ${this.game.durationRound} seconds.`;
	}

	public getType(): GameEvents {
		return GameEvents.ROUND_STARTED;
	}
}