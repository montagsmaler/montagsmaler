import { GameState } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { RoundEnded } from './RoundEnded';

@JSONSerializable()
export class RoundStarted extends GameState {

	startGame(): boolean {
		return false;
	}
	endGame(): boolean {
		return false;
	}
	startRound(): boolean {
		return false;
	}
	endRound(): boolean {
		this.context.setState(RoundEnded);
		return true;
	}
	publishImage(playerId: string, forRound: number): boolean {
		if (this.context.currentRound === forRound && !this.context.hasSubmitted(playerId, forRound)) {
			this.context.addSubmission(playerId, forRound);
			return true;
		} else {
			return false;
		}
	}
	imagesShouldBePublished(): boolean {
		return true;
	}
}
