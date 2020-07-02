import { Injectable } from '@nestjs/common';
import { PubSubService } from '../../shared/redis/pubsub/service/pubsub.service';
import { KeyValueService } from '../../shared/redis/keyvalue/service/keyvalue.service';
import { Player, Lobby, LobbyEvent, LOBBY_MAX_SIZE, LobbyPlayerJoinedEvent } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

const ACTIVE_LOBBIES = 'ACTIVE_LOBBIES';
const LOBBY_EXPIRE = 60 * 60 * 2;
const isExpired = (LOBBY_EXPIRE: number, LOBBY_CREATE: number): boolean => {
	return (new Date().getTime() > LOBBY_CREATE + LOBBY_EXPIRE * 1000);
}

@Injectable()
export class GameService {
	constructor(private readonly pubSubService: PubSubService, private readonly keyValueService: KeyValueService) { }

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
		let lobbyCount = Number.MAX_SAFE_INTEGER;
		try {
			lobby = await this.keyValueService.get<Lobby>(id);
		} catch (err) {
			throw new Error('Lobby not found.')
		}
		lobbyCount = await this.keyValueService.increment(id +  '_COUNT');
		try {
			if (lobbyCount > LOBBY_MAX_SIZE) throw new Error(`Can not add player "${player.id}" to lobby since it is already full. Maximum players per lobby ${LOBBY_MAX_SIZE}.`);
			try {
				lobby.addPlayer(player);
				await Promise.all([this.keyValueService.set<Lobby>(id, lobby), this.pubSubService.pubToChannel<LobbyEvent>(id, new LobbyPlayerJoinedEvent(player))]);
				return [lobby, this.pubSubService.onChannelPub<LobbyEvent>(id)];
			} catch (err) {
				throw new Error('Failed to join Lobby.');
			}
		} catch (err) {
			await this.keyValueService.decrement(id +  '_COUNT');
			throw err;
		}
	}
}
