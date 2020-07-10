import { SubscribeMessage, WebSocketGateway, WsResponse, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Namespace } from '../namespaces';
import { WsLobbyEvents } from './ws.lobby.events';
import { Observable, of, concat } from 'rxjs';
import { map, first } from 'rxjs/internal/operators';
import { LobbyEvent, Lobby, Player } from '../../../game/lobby/models';
import { GameService } from '../../../game';
import { HandleConnection, ConnectionResponse } from '../handleconnection';
import { UseGuards, UsePipes } from '@nestjs/common';
import { AuthCognitoGuard } from '../../http/auth/middleware/auth.guard';
import { ValidationPipe } from '../../../shared/validation';
import { VerifiedCognitoUser } from '../../http/auth/middleware/auth.cognito.user.decorator';
import { ClaimVerfiedCognitoUser } from '../../http/auth/models/aws-token';
import { GameInitRequestDto, LobbyJoinRequestDto } from './models';

@UsePipes(ValidationPipe)
@UseGuards(AuthCognitoGuard)
@WebSocketGateway({ namespace: Namespace.LOBBY })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly gameServive: GameService,
	) { }

	handleConnection(client: Socket, ...args: any[]): void {
		const reponse: ConnectionResponse = { success: true, namespace: Namespace.LOBBY, timestamp: new Date().getTime() };
		client.emit(HandleConnection.CONNECTED, reponse);
	}

	handleDisconnect(client: Socket): void {
		client.emit(HandleConnection.DISCONNECTED, 'Connection has been disconnected!')
	}

	@SubscribeMessage(WsLobbyEvents.INIT_LOBBY)
	async handleLobbyInit(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser): Promise<Observable<WsResponse<Lobby | LobbyEvent>>> {
		const lobbyInitData = await this.gameServive.initLobby(Player.fromCognitoUser(user));
		return this.lobbyEventsToWsResonse(...lobbyInitData);
	}

	@SubscribeMessage(WsLobbyEvents.PLAYER_JOINED)
	async handlePlayerJoin(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser, @MessageBody() data: LobbyJoinRequestDto): Promise<Observable<WsResponse<Lobby | LobbyEvent>>> {
		const lobbyJoinData = await this.gameServive.joinLobby(data.lobbyId, Player.fromCognitoUser(user));
		return this.lobbyEventsToWsResonse(...lobbyJoinData);
	}

	@SubscribeMessage(WsLobbyEvents.GAME_INIT)
	async gameInit(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser, @MessageBody() data: GameInitRequestDto): Promise<void> {
		const initGameData = await this.gameServive.initGame(data.lobbyId, Player.fromCognitoUser(user), { roundDuration: data.roundDuration, rounds: data.rounds });
	}

	private lobbyEventsToWsResonse(lobby: Lobby, lobbyEvents: Observable<LobbyEvent>): Observable<WsResponse<Lobby | LobbyEvent>> {
		const wsResponseEvents = lobbyEvents.pipe(
			//tap(lobbyEvent => console.log(lobbyEvent.getType().toString())),
			map(lobbyEvent => {
				return { event: lobbyEvent.getType().toString(), data: lobbyEvent };
			}),
		);
		return concat(of({ event: WsLobbyEvents.GET_LOBBY, data: lobby }).pipe(first()), wsResponseEvents);
	}

}
