import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LobbyService } from '../lobby/service/lobby.service';
import { GameRoundService } from '../game-round/service/game-round.service';
import { LockService } from '../../shared/redis';
import { GameStateService } from '../game-state';
import { Player, Lobby, LobbyEvent } from '../lobby/models';
import { GameConfig, Game, GameEvent } from '../game-round/models';
import { ImageService } from '../image';

const IMAGE = 'image:';

@Injectable()
export class GameService {
	constructor(
		private readonly lobbyService: LobbyService,
		private readonly gameRoundService: GameRoundService,
		private readonly gameStateService: GameStateService,
		private readonly imageService: ImageService,
		private readonly lockService: LockService,
	) { }

	public async initLobby(initPlayer: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		return await this.lobbyService.initLobby(initPlayer);
	}

	public async joinLobby(lobbyId: string, player: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		return await this.lobbyService.joinLobby(lobbyId, player);
	}

	public async leaveLobby(lobbyId: string, player: Player): Promise<void> {
		try {
			await this.lobbyService.leaveLobby(lobbyId, player);
		} catch (err) {
			console.log(err);
		}
	}

	public async initGame(lobbyId: string, initPlayer: Player, gameConfig: GameConfig): Promise<[Game, Observable<GameEvent>]> {
		const lock = await this.lockService.lockRessource(lobbyId);
		let game: Game;
		let events: Observable<GameEvent>;
		try {
			const lobby = await this.lobbyService.getLobby(lobbyId);
			if (lobby.getLeader().id !== initPlayer.id) throw new Error('Player is not authorized to start the lobby.');
			[game, events] = await this.gameRoundService.initGame(initPlayer, lobby, gameConfig.roundDuration, gameConfig.rounds);
			await this.lobbyService.consumeLobby(lobbyId, initPlayer, game);
			return [game, events];
		} catch (err) {
			if (game) {
				await this.gameRoundService.deleteGame(game.id);
			}
			throw err;
		} finally {
			await lock.unlock();
		}
	}

	public async joinGame(gameId: string, joinPlayer: Player): Promise<[Game, Observable<GameEvent>]> {
		try {
			return await this.gameRoundService.joinGame(gameId, joinPlayer.id);
		} catch (err) {
			throw err;
		}
	}

	public async tryPublishImage(gameId: string, player: Player, imageBase64: string, forRound: number): Promise<boolean> {
		const lock = await this.lockService.lockRessource(IMAGE + player.id);
		try {
			const canPublish = await this.gameStateService.canPublishImage(gameId, player.id, forRound);
			if (canPublish.accepted) {
				await this.imageService.publishAndRateImage(gameId, player, imageBase64, forRound);
			}
			return canPublish.accepted;
		} catch (err) {
			throw err;
		} finally {
			await lock.unlock();
		}
	}

}
