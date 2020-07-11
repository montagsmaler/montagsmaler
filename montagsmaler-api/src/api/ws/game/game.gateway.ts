import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WsResponse } from '@nestjs/websockets';
import { UsePipes, UseGuards } from '@nestjs/common';
import { AuthCognitoGuard } from '../../http/auth/middleware/auth.guard';
import { WsNamespace } from '../ws.namespaces';
import { ValidationPipe } from '../../../shared/validation';
import { Socket } from 'socket.io';
import { WsConnectionResponse, WsHandleConnection } from '../ws.handleconnection';
import { WsGameEvents } from './ws.game.events';
import { VerifiedCognitoUser } from '../../http/auth/middleware/auth.cognito.user.decorator';
import { ClaimVerfiedCognitoUser } from '../../http/auth/models/aws-token';
import { GameJoinRequestDto, GameImagePublishRequestDto } from './models';
import { Game, GameEvent } from '../../../game/game-round/models';
import { Observable, of, concat } from 'rxjs';
import { map, first } from 'rxjs/internal/operators';
import { GameService } from '../../../game';
import { Player } from '../../../game/lobby/models';

@UsePipes(ValidationPipe)
@UseGuards(AuthCognitoGuard)
@WebSocketGateway({ namespace: WsNamespace.GAME })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly gameService: GameService,
	) { }

	handleConnection(client: Socket, ...args: any[]): void {
		const reponse: WsConnectionResponse = { success: true, namespace: WsNamespace.GAME, timestamp: new Date().getTime() };
		client.emit(WsHandleConnection.CONNECTED, reponse);
	}

	handleDisconnect(client: Socket): void {
		client.emit(WsHandleConnection.DISCONNECTED, 'Connection has been disconnected!');
	}

	@SubscribeMessage(WsGameEvents.JOIN_GAME)
	async handleGameJoin(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser, @MessageBody() data: GameJoinRequestDto): Promise<Observable<WsResponse<Game | GameEvent>>> {
		return this.gameEventsToWsResonse(...(await this.gameService.joinGame(data.gameId, Player.fromCognitoUser(user))));
	}

	@SubscribeMessage(WsGameEvents.PUBLISH_IMAGE)
	async handleImagePublish(@VerifiedCognitoUser() user: ClaimVerfiedCognitoUser, @MessageBody() data: GameImagePublishRequestDto): Promise<void> {
		await this.gameService.tryPublishImage(data.gameId, Player.fromCognitoUser(user), data.imageBase64, data.forRound);
	}

	private gameEventsToWsResonse(game: Game, gameEvents: Observable<GameEvent>): Observable<WsResponse<Game | GameEvent>> {
		const wsResponseEvents = gameEvents.pipe(map(gameEvent => ({ event: gameEvent.getType().toString(), data: gameEvent })));
		return concat(of({ event: WsGameEvents.GET_GAME, data: game }).pipe(first()), wsResponseEvents);
	}
}
