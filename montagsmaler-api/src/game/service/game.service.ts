import { Injectable } from '@nestjs/common';
import { PubSubService } from '../../shared/redis/pubsub/service/pubsub.service';
import { KeyValueService } from '../../shared/redis/keyvalue/service/keyvalue.service';
import { LockService } from '../../shared/redis/lock/service/lock.service';
import { Player, Lobby, LobbyEvent, LobbyPlayerJoinedEvent } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

const ACTIVE_LOBBIES = 'ACTIVE_LOBBIES';
const LOBBY_EXPIRE = 60 * 60 * 2;
const isExpired = (LOBBY_EXPIRE: number, LOBBY_CREATE: number): boolean => {
	return (new Date().getTime() > LOBBY_CREATE + LOBBY_EXPIRE * 1000);
}

@Injectable()
export class GameService {
	constructor(
		private readonly pubSubService: PubSubService, 
		private readonly keyValueService: KeyValueService,
		private readonly lockService: LockService,
		) { }

	public async initLobby(initPlayer: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		try {
			const id = uuidv4();
			const lobby = new Lobby(id, new Date().getTime(), [initPlayer]);
			await Promise.all([this.keyValueService.set<Lobby>(id, lobby), this.keyValueService.addToSet<string>(ACTIVE_LOBBIES, id)])
			return [lobby, this.pubSubService.onChannelPub<LobbyEvent>(id)];
		} catch (err) {
			throw new Error('Failed to init lobby.');
		}
	}

	public async joinLobby(id: string, player: Player): Promise<[Lobby, Observable<LobbyEvent>]> {
		let lobby: Lobby;
		const lock = await this.lockService.lockRessource(id);
		try {
			try {
				lobby = await this.keyValueService.get<Lobby>(id);
			} catch (err) {
				throw new Error('Lobby not found.')
			}
			try {
				lobby.addPlayer(player);
				await Promise.all([this.keyValueService.set<Lobby>(id, lobby), this.pubSubService.pubToChannel<LobbyEvent>(id, new LobbyPlayerJoinedEvent(player))]);
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
}
