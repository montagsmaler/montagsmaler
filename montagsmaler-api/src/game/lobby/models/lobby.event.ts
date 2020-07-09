import { Player } from './player';

export interface LobbyEvent {
	getTrigger(): 'SYSTEM' | Player;
	getMessage(): string;
}