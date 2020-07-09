import { GameState, IStateAccepted } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { RoundStarted } from './RoundStarted';

@JSONSerializable()
export class GameStarted extends GameState {

	startGame(): IStateAccepted {
		return this.getStateAccepted(false);
	}
	endGame(): IStateAccepted {
		return this.getStateAccepted(false);
	}
	startRound(): IStateAccepted {
		this.context.setState(RoundStarted);
		return this.getStateAccepted(true);
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
