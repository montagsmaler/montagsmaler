import { JSONSerializable } from '../../../../shared/serializable';
import { CreatedAt } from '../../../../shared/helper';
import { GameEvents,  GameEvent, Game, Image } from '../';
import { Player } from '../../../lobby/models';

//@CreatedAt()
@JSONSerializable()
export class GameRoundOverEvent implements GameEvent {

	constructor(public readonly game: Game, public readonly round: number, public readonly imageSubmissions: Image[]) {}

  public getTrigger(): 'GAME' | Player {
    return 'GAME';
  }

  public getMessage(): string {
    return `${this.round}/${this.game.rounds} round is over for game ${this.game.id}. No submissions accepted anymore for round ${this.round}.`;
	}
	
	public getType(): GameEvents {
		return GameEvents.ROUND_OVER;
	}
}
