import { GameState } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { RoundStarted } from './RoundStarted';
import { GameEnded } from './GameEnded';

@JSONSerializable()
export class RoundEnded extends GameState {

	startGame(): boolean {
		return false;
	}
	endGame(): boolean {
		if (this.context.currentRound === this.context.maxRound) {
			this.context.setState(GameEnded);
			return true;
		} else {
			return false;
		}
	}
	startRound(): boolean {
		if (this.context.currentRound < this.context.maxRound) {
			this.context.incrementRound();
			this.context.setState(RoundStarted);
			return true;
		} else {
			return false;
		}
	}
	endRound(): boolean {
		return false;
	}
	publishImage(playerId: string, forRound: number): boolean {
		return false;
	}
}