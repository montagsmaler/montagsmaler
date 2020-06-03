import { SubscribeMessage, WebSocketGateway, WsResponse, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Namespace } from '../namespaces';
import { GameEvent } from './game-events';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/internal/operators';

@WebSocketGateway({namespace: Namespace.GAME})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {  
  
  handleConnection(client: Socket, ...args: any[]): void {
    client.emit(GameEvent.CONNECTED, 'Connection has been established!');
  }

  handleDisconnect(client: Socket): void {
    console.log('handleDisconnect');
    throw new Error("Method not implemented.");
  }
  
  @SubscribeMessage(GameEvent.INIT_GAME)
  handleStartGame(client: Socket, payload: string): Observable<WsResponse<string>> {
    console.log('handleStartGame');
    return of({event: GameEvent.GAME_STARTED, data: 'Game has started!'}).pipe(delay(4000));
  }
}
