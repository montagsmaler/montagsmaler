import { SubscribeMessage, WebSocketGateway, WsResponse, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Namespace } from '../namespaces';
import { WsLobbyEvents } from './ws.lobby.events';
import { Observable, of, concat } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { LobbyEvent, Lobby } from '../../../game/lobby/models';
import { GameService } from '../../../game';
import { HandleConnection } from '../handleconnection';

@WebSocketGateway({ namespace: Namespace.LOBBY })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly gameServive: GameService,
	) { }

	handleConnection(client: Socket, ...args: any[]): void {
		client.emit(HandleConnection.CONNECTED, `Connection for ${this.constructor.name} has been established!`);
	}

	handleDisconnect(client: Socket): void {
		client.emit(HandleConnection.DISCONNECTED, 'Connection has been disconnected!')
	}

	@SubscribeMessage(WsLobbyEvents.INIT_LOBBY)
	async handleLobbyInit(@MessageBody() data: any): Promise<Observable<WsResponse<Lobby | LobbyEvent>>> {
		const verifiedPlayer = data.player;  //how to verify player?
		const [lobby, events] = await this.gameServive.initLobby(verifiedPlayer);
		const wsResponseEvents: Observable<WsResponse<LobbyEvent>> = events.pipe(
			map(lobbyEvent => {
				return { event: lobbyEvent.getType().toString(), data: lobbyEvent };
			}),
		);
		return concat(of({ event: WsLobbyEvents.GET_LOBBY, data: lobby }), wsResponseEvents);
	}

	@SubscribeMessage(WsLobbyEvents.PLAYER_JOIN)
	async handlePlayerJoin(@MessageBody() data: any): Promise<Observable<WsResponse<Lobby | LobbyEvent>>> {
		const verifiedPlayer = data.player;  //how to verify player?
		const lobbyId = data.lobbyId;
		const [lobby, events] = await this.gameServive.joinLobby(lobbyId, verifiedPlayer);
		const wsResponseEvents: Observable<WsResponse<LobbyEvent>> = events.pipe(
			map(lobbyEvent => {
				return { event: lobbyEvent.getType().toString(), data: lobbyEvent };
			}),
		);
		return concat(of({ event: WsLobbyEvents.GET_LOBBY, data: lobby }), wsResponseEvents);
	}
}
