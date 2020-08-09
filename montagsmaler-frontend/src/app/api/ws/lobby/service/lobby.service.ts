import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WsClientService } from '../../ws-client';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private readonly namespace = 'lobby';
  private readonly lobbyConnection = this.wsClient.getConnectionForNamespace(this.namespace);

  constructor(private readonly wsClient: WsClientService) { }

  public close(): void {
    this.lobbyConnection.close();
  }
}
