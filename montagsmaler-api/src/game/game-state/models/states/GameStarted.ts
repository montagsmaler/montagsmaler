import { GameState } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { RoundStarted } from './RoundStarted';

@JSONSerializable()
export class GameStarted extends GameState {

	startGame(): boolean {
		return false;
	}
	endGame(): boolean {
		return false;
	}
	startRound(): boolean {
		this.context.incrementRound();
		this.context.setState(RoundStarted);
		return true;
	}
	endRound(): boolean {
		return false;
	}
	publishImage(playerId: string, forRound: number): boolean {
		return false;
	}
	imagesShouldBePublished(): boolean {
		return false;
	}
}
