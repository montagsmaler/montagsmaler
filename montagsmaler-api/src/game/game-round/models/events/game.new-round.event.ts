import { JSONSerializable } from '../../../../shared/serializable';
import { CreatedAt } from '../../../../shared/helper';
import { GameEvents,  GameEvent, Game } from '../';
import { Player } from '../../../lobby/models';

//@CreatedAt()
@JSONSerializable()
export class NewGameRoundEvent implements GameEvent {

	constructor(public readonly game: Game, public readonly round: number) {}

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