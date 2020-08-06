import { Player } from './player';
import { LobbyEvents } from './lobby.events';

export interface LobbyEvent {
	readonly id: number;
	getTrigger(): 'SYSTEM' | Player;
	getMessage(): string;
	getType(): LobbyEvents;
}