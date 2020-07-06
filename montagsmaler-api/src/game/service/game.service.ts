import { Injectable } from '@nestjs/common';
import { Player, Lobby, LobbyEvent, GameConfig, Game, GameEvent } from '../models';
import { Observable } from 'rxjs';
import { LobbyService } from '../lobby/service/lobby.service';
import { GameRoundService } from '../game-round/service/game-round.service';
import { LockService } from '../../shared/redis';

@Injectable()
export class GameService {
	constructor(
		private readonly lobbyService: LobbyService,
		private readonly gameRoundService: GameRoundService,
		private readonly lockService: LockService,
	) { }

	public async initLobby(initPlayer: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		return await this.lobbyService.initLobby(initPlayer);
	}

	public async joinLobby(lobbyId: string, player: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		return await this.lobbyService.joinLobby(lobbyId, player);
	}

	public async initGame(lobbyId: string, initPlayer: Player, gameConfig: GameConfig): Promise<[Game, Observable<GameEvent>]> {
		const lock = await this.lockService.lockRessource(lobbyId);
		try {
			const lobby = await this.lobbyService.getLobby(lobbyId);
			if (lobby.getLeader().id !== initPlayer.id) throw new Error('Player is not authorized to start the lobby.');
			const gameData = await this.gameRoundService.initGame(lobby, gameConfig.roundDuration, gameConfig.rounds);
			await this.lobbyService.consumeLobby(lobbyId);
			return gameData;
		} catch (err) {
			throw err;
		} finally {
			await lock.unlock();
		}
	}
}
