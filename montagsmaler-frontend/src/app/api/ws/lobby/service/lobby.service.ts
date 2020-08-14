import { Injectable } from '@angular/core';
import { WsClientService, IWsConnection } from '../../ws-client';
import { LobbyEvents, Lobby } from '../models';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { first, filter, tap } from 'rxjs/internal/operators';
import { LobbyJoinRequest, LobbyLeaveRequest, IGameInitRequest, GameInitRequest } from '../models/requests';
import { LobbyPlayerLeftEvent, LobbyPlayerJoinedEvent, LobbyConsumedEvent } from '../models/events';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private readonly namespace = 'lobby';
  private lobbyConnection: IWsConnection | null = null;
  private readonly lobby$ = new BehaviorSubject<Lobby | null>(null);
  private lobbyPlayerJoinedSub: Subscription;
  private lobbyPlayerLeftSub: Subscription;

  constructor(private readonly wsClient: WsClientService) { }

  private connect(): void {
    if (!this.lobbyConnection) {
      this.lobbyConnection = this.wsClient.getConnectionForNamespace(this.namespace);
    }
  }

  public async joinLobby(lobbyId: string): Promise<void> {
    const lobbyJoinRequest = await LobbyJoinRequest.fromObject({ lobbyId });
    this.connect();
    this.subToLobbyEvents();
    this.lobbyConnection.sendMessage(LobbyEvents.PLAYER_JOINED, lobbyJoinRequest);
  }

  public createLobby(): void {
    this.connect();
    this.subToLobbyEvents();
    this.lobbyConnection.sendMessage(LobbyEvents.INIT_LOBBY, {});
  }

  public async leaveLobby(): Promise<void> {
    if (this.getLobby() === null) {
      throw new Error('Lobby is null');
    }
    const lobbyLeaveRequest = await LobbyLeaveRequest.fromObject({ lobbyId: this.getLobby().id });
    this.lobbyConnection.sendMessage(LobbyEvents.PLAYER_LEFT, lobbyLeaveRequest);
    this.unsubscribeLobbyEvents();
    this.lobby$.next(null);
  }

  private subToLobbyEvents(): void {
    this.getLobbyEvent$().subscribe(lobby => this.lobby$.next(new Lobby(lobby.id, lobby.createdAt, lobby.members)));

    this.lobbyPlayerJoinedSub = this.getLobbyPlayerJoinedEvents$().subscribe(lobbyPlayerJoinedEvent => {
      const lobby = this.getLobby();
      lobby.addPlayer(lobbyPlayerJoinedEvent.player);
      this.lobby$.next(lobby);
    });

    this.lobbyPlayerLeftSub = this.getLobbyPlayerLeftEvents$().subscribe(lobbyPlayerLeftEvent => {
      const lobby = this.getLobby();
      lobby.removePlayer(lobbyPlayerLeftEvent.player);
      this.lobby$.next(lobby);
    });
  }

  private unsubscribeLobbyEvents(): void {
    try {
      if (this.lobbyPlayerJoinedSub) {
        this.lobbyPlayerJoinedSub.unsubscribe();
      }
      if (this.lobbyPlayerLeftSub) {
        this.lobbyPlayerLeftSub.unsubscribe();
      }
    } catch (err) {
      console.warn(err);
    }
  }

  public getLobby$(): Observable<Lobby> {
    return this.lobby$.pipe(
      filter(lobby => (lobby) ? true : false),
    );
  }

  public getLobby(): Lobby | null {
    return this.lobby$.value;
  }

  private getLobbyEvent$(): Observable<Lobby> {
    return this.lobbyConnection.getMessages$<Lobby>(LobbyEvents.GET_LOBBY).pipe(
      first(),
    );
  }

  public async initGame(gameInitRequest: IGameInitRequest): Promise<void> {
    const gameInitRequestValidated = await GameInitRequest.fromObject(gameInitRequest);
    this.lobbyConnection.sendMessage(LobbyEvents.GAME_INIT, gameInitRequestValidated);
  }

  public getLobbyPlayerLeftEvents$(): Observable<LobbyPlayerLeftEvent> {
    return this.lobbyConnection.getMessages$<LobbyPlayerLeftEvent>(LobbyEvents.PLAYER_LEFT);
  }

  public getLobbyPlayerJoinedEvents$(): Observable<LobbyPlayerJoinedEvent> {
    return this.lobbyConnection.getMessages$<LobbyPlayerJoinedEvent>(LobbyEvents.PLAYER_JOINED);
  }

  public getLobbyConsumedEvent$(): Observable<LobbyConsumedEvent> {
    return this.lobbyConnection.getMessages$<LobbyConsumedEvent>(LobbyEvents.CONSUMED).pipe(
      first(),
      tap(() => this.disconnect()),
    );
  }

  public disconnect(): void {
    if (this.lobbyConnection) {
      try {
        this.unsubscribeLobbyEvents();
        this.lobby$.next(null);
        this.lobbyConnection.disconnect();
        this.lobbyConnection = null;
      } catch (err) {
        console.warn(err);
      }
    }
  }
}
