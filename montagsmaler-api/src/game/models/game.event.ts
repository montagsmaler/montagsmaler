import { Player } from './player';
import { GameEvents } from './game.events';

export interface GameEvent {
  getTrigger(): 'GAME' | Player;
	getMessage(): string;
	getType(): GameEvents,
}
