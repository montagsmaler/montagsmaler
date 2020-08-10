import { Injectable } from '@angular/core';
import { RxjsWsConnection, IWsConnection, WsConnection } from './ws-connection';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { AuthService } from 'src/app/api/http/auth';
import { Router } from '@angular/router';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { SKIP_ACCESS_TOKEN } from 'src/app/api/http/auth/interceptor/auth.utility';
import { WsMessage } from './models/ws-client.response';

@Injectable({
  providedIn: 'root'
})
export class WsClientService {

  private readonly wsEndpoint: string = environment.wsEndpoint;

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  public getConnectionForNamespace(namespace: string): IWsConnection {
    const token = this.authService.getAccessToken();
    if (!token) {
      this.router.navigateByUrl('/welcome');
      throw new Error('User is not authenticated.');
    }
    const connStr = `${this.wsEndpoint}/${namespace}?authorization=Bearer ${token.jwtToken}`;
    const websocketSubject = webSocket(connStr);
    //return new WsConnection(io(connStr));
    return new RxjsWsConnection(websocketSubject as WebSocketSubject<WsMessage>);
  }
}
