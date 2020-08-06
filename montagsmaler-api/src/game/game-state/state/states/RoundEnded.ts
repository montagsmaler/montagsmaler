import { GameState, IStateAccepted } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { RoundStarted } from './RoundStarted';
import { GameEnded } from './GameEnded';

@JSONSerializable()
export class RoundEnded extends GameState {

	startGame(): IStateAccepted {
		return this.getStateAccepted(false);
	}
	endGame(): IStateAccepted {
		if (this.context.currentRound === this.context.maxRound) {
			this.context.setState(GameEnded);
			return this.getStateAccepted(true);
		} else {
			return this.getStateAccepted(false);
		}
	}
	startRound(): IStateAccepted {
		if (this.context.currentRound < this.context.maxRound) {
			this.context.setState(RoundStarted);
			return this.getStateAccepted(true);
		} else {
			return this.getStateAccepted(false);
		}
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