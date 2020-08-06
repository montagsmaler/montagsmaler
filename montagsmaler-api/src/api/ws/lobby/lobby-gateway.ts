import { SubscribeMessage, WebSocketGateway, WsResponse, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsNamespace } from '../ws.namespaces';
import { WsLobbyEvents } from './ws.lobby.events';
import { Observable, of, concat } from 'rxjs';
import { map, first } from 'rxjs/internal/operators';
import { LobbyEvent, Lobby, Player } from '../../../game/lobby/models';
import { GameService } from '../../../game';
import { WsHandleConnection, WsConnectionResponse } from '../ws.handleconnection';
import { UseGuards, UsePipes } from '@nestjs/common';
import { AuthCognitoGuard } from '../../http/auth/middleware/auth.guard';
import { ValidationPipe } from '../../../shared/validation';
import { VerifiedCognitoUser } from '../../http/auth/middleware/auth.cognito.user.decorator';
import { ClaimVerfiedCognitoUser } from '../../http/auth/models/aws-token';
import { GameInitRequestDto, LobbyJoinRequestDto, LobbyLeaveRequestDto } from './models';

@UsePipes(ValidationPipe)
@UseGuards(AuthCognitoGuard)
@WebSocketGateway({ namespace: WsNamespace.LOBBY })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly gameServive: GameService,
	) { }

	handleConnection(client: Socket, ...args: any[]): void {
		const reponse: WsConnectionResponse = { success: true, namespace: WsNamespace.LOBBY, timestamp: new Date().getTime() };
		client.emit(WsHandleConnection.CONNECTED, reponse);
	}

	handleDisconnect(client: Socket): void {
		client.emit(WsHandleConnection.DISCONNECTED, 'Connection has been disconnected!');
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

	@SubscribeMessage(WsLobbyEvents.PLAYER_LEFT)
	async handlePlayerLeave(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser, @MessageBody() data: LobbyLeaveRequestDto): Promise<void> {
		await this.gameServive.leaveLobby(data.lobbyId, Player.fromCognitoUser(user));
	}

	@SubscribeMessage(WsLobbyEvents.GAME_INIT)
	async gameInit(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser, @MessageBody() data: GameInitRequestDto): Promise<void> {
		const initGameData = await this.gameServive.initGame(data.lobbyId, Player.fromCognitoUser(user), { roundDuration: data.roundDuration, rounds: data.rounds });
	}

	private lobbyEventsToWsResonse(lobby: Lobby, lobbyEvents: Observable<LobbyEvent>): Observable<WsResponse<Lobby | LobbyEvent>> {
		const wsResponseEvents = lobbyEvents.pipe(map(lobbyEvent => ({ event: lobbyEvent.getType().toString(), data: lobbyEvent })));
		return concat(of({ event: WsLobbyEvents.GET_LOBBY, data: lobby }).pipe(first()), wsResponseEvents);
	}
}
