import { Injectable } from '@angular/core';
import { WsConnection, IWsConnection } from './ws-connection';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { AuthService } from 'src/app/api/http/auth';
import { Router } from '@angular/router';

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
    const options: any = {
      extraHeaders: {
        Authorization: `Bearer ${token.jwtToken}`,
      },
    };
    const connection = io(`${this.wsEndpoint}/${namespace}`, options);
    return new WsConnection(connection);
  }
}
