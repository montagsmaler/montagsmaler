import { Player } from './player';
import { LobbyEvents } from './lobby.events';

export interface LobbyEvent {
	getTrigger(): 'SYSTEM' | Player;
	getMessage(): string;
	getType(): LobbyEvents;
}