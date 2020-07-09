import { GameState } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';

@JSONSerializable()
export class GameEnded extends GameState {

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
		return false;
	}
	publishImage(playerId: string, forRound: number): boolean {
		return false;
	}
	imagesShouldBePublished(): boolean {
		return false;
	}
}