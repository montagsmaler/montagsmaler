import { Injectable } from '@nestjs/common';
import { Player, Lobby, LobbyEvent } from '../models';
import { Observable } from 'rxjs';
import { LobbyService } from '../lobby/service/lobby.service';

@Injectable()
export class GameService {
	constructor(
		private readonly lobbyService: LobbyService
		) { }

	public async initLobby(initPlayer: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		return await this.lobbyService.initLobby(initPlayer);
	}

	public async joinLobby(id: string, player: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		return await this.lobbyService.joinLobby(id, player);
	}
}
