import { Injectable } from '@nestjs/common';
import { PubSubService, KeyValueService, LockService } from '../../../shared/redis';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HOUR_IN_SECONDS } from '../../../shared/helper';
import { Player, Lobby, LobbyEvent, LobbyPlayerJoinedEvent, LobbyPlayerLeftEvent } from '../models';
import { LobbyConsumedEvent } from '../models/events/lobby.consumed.event';
import { Game } from '../../../game/game-round/models';

const ACTIVE_LOBBIES = 'ACTIVE_LOBBIES';
const LOBBY = 'lobby:';

@Injectable()
export class LobbyService {

	constructor(
		private readonly pubSubService: PubSubService,
		private readonly keyValueService: KeyValueService,
		private readonly lockService: LockService,
	) { }

	public async initLobby(initPlayer: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		try {
			const id = uuidv4();
			const lobby = new Lobby(id, new Date().getTime(), [initPlayer]);
			await this.setLobby(id, lobby);
			return [lobby, this.pubSubService.onChannelPub<LobbyEvent>(id)];
		} catch (err) {
			throw new Error('Failed to init lobby.');
		}
	}

	public async joinLobby(id: string, player: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		const lock = await this.lockService.lockRessource(id);
		try {
			const lobby = await this.getLobby(id);
			lobby.addPlayer(player);
			try {
				await Promise.all([this.setLobby(id, lobby), this.pubLobbyEvent(id, new LobbyPlayerJoinedEvent(player))]);
				return [lobby, this.pubSubService.onChannelPub<LobbyEvent>(id)];
			} catch (err) {
				throw new Error('Failed to join Lobby.');
			}
		} catch (err) {
			throw err;
		} finally {
			await lock.unlock();
		}
	}

	public async leaveLobby(id: string, leavingPlayer: Player): Promise<void> {
		const lock = await this.lockService.lockRessource(id);
		try {
			const lobby = await this.getLobby(id);
			lobby.removePlayer(leavingPlayer);
			try {
				await Promise.all([this.setLobby(id, lobby), this.pubLobbyEvent(id, new LobbyPlayerLeftEvent(leavingPlayer))]);
			} catch (err) {
				throw new Error('Hotel California.');
			}
		} catch (err) {
			throw err;
		} finally {
			await lock.unlock();
		}
	}

	private async pubLobbyEvent(id: string, event: LobbyEvent): Promise<void> {
		try {
			await this.pubSubService.pubToChannel<LobbyEvent>(id, event);
		} catch (err) {
			throw new Error('Could not public LobbyEvent.');
		}
	}

	private async setLobby(id: string, lobby: Lobby): Promise<void> {
		try {
			await this.keyValueService.set<Lobby>(LOBBY + id, lobby, HOUR_IN_SECONDS << 1);
		} catch (err) {
			throw new Error('Could not set Lobby.');
		}
	}

	public async getLobby(id: string): Promise<Lobby> {
		try {
			return await this.keyValueService.get<Lobby>(LOBBY + id);
		} catch (err) {
			throw new Error('Lobby not found.');
		}
	}

	public async consumeLobby(id: string, player: Player, game: Game): Promise<void> {
		try {
			await this.pubLobbyEvent(id, new LobbyConsumedEvent(player, game))
			await Promise.all([this.keyValueService.delete(LOBBY + id), this.pubSubService.deleteChannelHistory(id)]);
		} catch (err) {
			throw new Error('Could not delete Lobby.');
		}
	}
}
