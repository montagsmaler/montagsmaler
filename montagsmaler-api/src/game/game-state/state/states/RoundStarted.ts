import { GameState, IStateAccepted } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { RoundEnded } from './RoundEnded';

@JSONSerializable()
export class RoundStarted extends GameState {

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
		this.context.setState(RoundEnded);
		return this.getStateAccepted(true);
	}
	publishImage(playerId: string, forRound: number): IStateAccepted {
		if (this.context.currentRound === forRound && !this.context.hasSubmitted(playerId, forRound)) {
			this.context.addSubmission(playerId, forRound);
			return this.getStateAccepted(true);
		} else {
			return this.getStateAccepted(false);
		}
	}
	imagesShouldBePublished(): IStateAccepted {
		return this.getStateAccepted(true);
	}
}
