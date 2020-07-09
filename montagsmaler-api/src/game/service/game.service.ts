import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LobbyService } from '../lobby/service/lobby.service';
import { GameRoundService } from '../game-round/service/game-round.service';
import { LockService } from '../../shared/redis';
import { GameStateService } from '../game-state';
import { Player, Lobby, LobbyEvent } from '../lobby/models';
import { GameConfig, Game, GameEvent, Image } from '../game-round/models';

@Injectable()
export class GameService {
	constructor(
		private readonly lobbyService: LobbyService,
		private readonly gameRoundService: GameRoundService,
		private readonly gameStateService: GameStateService,
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
		let gameData: [Game, Observable<GameEvent>];
		try {
			const lobby = await this.lobbyService.getLobby(lobbyId);
			if (lobby.getLeader().id !== initPlayer.id) throw new Error('Player is not authorized to start the lobby.');
			gameData = await this.gameRoundService.initGame(lobby, gameConfig.roundDuration, gameConfig.rounds);
			await this.gameStateService.registerGame(...gameData);
			await this.lobbyService.consumeLobby(lobbyId);
			return gameData;
		} catch (err) {
			if (gameData) {
				await this.gameRoundService.deleteGame(gameData[0].id);
			}
			throw err;
		} finally {
			await lock.unlock();
		}
	}

	public async tryPublishImage(gameId: string, image: Image): Promise<boolean> {
		try {
			const canPublish = await this.gameStateService.canPublishImage(gameId, image.player.id, image.getRound());
			if (canPublish) {
				await this.gameRoundService.addImage(gameId, image);
			}
			return canPublish;
		} catch (err) {
			throw err;
		}
	}
}
