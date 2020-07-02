export enum LobbyEvents {
	PLAYER_JOINED = 'PLAYER_JOINED',
}

export class LobbyEvent {
	constructor(public readonly event: LobbyEvents) { }
}