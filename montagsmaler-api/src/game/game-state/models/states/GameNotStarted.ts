import { GameState } from '../GameState';
import { JSONSerializable } from '../../../../shared/serializable';
import { GameStarted } from './GameStarted';

@JSONSerializable()
export class GameNotStarted extends GameState {

	startGame(): boolean {
		this.context.setState(GameStarted);
		return true;
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