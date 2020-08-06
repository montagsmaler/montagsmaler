import { GameState, IStateAccepted } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';

@JSONSerializable()
export class GameEnded extends GameState {

	startGame(): IStateAccepted {
		return this.getStateAccepted(false);
	}
	endGame(): IStateAccepted {
		return this.getStateAccepted(false);
	}
	startRound(): IStateAccepted {
		return this.getStateAccepted(false);
	}
	endRound(): IStateAccepted {
		return this.getStateAccepted(false);
	}
	publishImage(playerId: string, forRound: number): IStateAccepted {
		return this.getStateAccepted(false);
	}
	imagesShouldBePublished(): IStateAccepted {
		return this.getStateAccepted(false);
	}
}