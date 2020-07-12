import { Player } from '../../lobby/models/player';
import { GameEvents } from './game.events';

export interface GameEvent {
	readonly id: number;
  getTrigger(): 'GAME' | Player;
	getMessage(): string;
	getType(): GameEvents,
}
