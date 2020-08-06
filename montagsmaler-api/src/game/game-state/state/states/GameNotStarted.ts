import { GameState, IStateAccepted } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { GameStarted } from './GameStarted';

@JSONSerializable()
export class GameNotStarted extends GameState {

	startGame(): IStateAccepted {
		this.context.setState(GameStarted);
		return this.getStateAccepted(true);
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