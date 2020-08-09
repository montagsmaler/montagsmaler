import { Injectable } from '@angular/core';
import { WsClientService } from '../../ws-client';
import { LobbyEvents, Lobby } from '../models';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { first } from 'rxjs/internal/operators';
import { LobbyJoinRequest, LobbyLeaveRequest } from '../models/requests';
import { LobbyPlayerLeftEvent, LobbyPlayerJoinedEvent, LobbyConsumedEvent } from '../models/events';
import { IWsConnection } from '../../ws-client/service/ws-connection';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private readonly namespace = 'lobby';
  private lobbyConnection: IWsConnection | null = null;
  private readonly lobby$ = new BehaviorSubject<Lobby | null>(null);
  private lobbyPlayerJoinedSub: Subscription;
  private lobbyPlayerLeftSub: Subscription;
  private lobbyConsumedSub: Subscription;

  constructor(private readonly wsClient: WsClientService) { }

  public initCon(): void {
    if (!this.lobbyConnection) {
      this.lobbyConnection = this.wsClient.getConnectionForNamespace(this.namespace);
    }
  }

  public joinLobby(lobbyId: string): void {
    this.subToLobbyEvents();
    const lobbyJoinRequest = LobbyJoinRequest.fromObject({ lobbyId });
    this.lobbyConnection.sendMessage(LobbyEvents.PLAYER_JOINED, lobbyJoinRequest);
  }

  public createLobby(): void {
    this.subToLobbyEvents();
    this.lobbyConnection.sendMessage(LobbyEvents.INIT_LOBBY, {});
  }

  public leaveLobby(): void {
    if (this.getLobby() === null) throw new Error('Lobby is null');
    const lobbyLeaveRequest = LobbyLeaveRequest.fromObject({ lobbyId: this.getLobby().id });
    this.lobbyConnection.sendMessage(LobbyEvents.PLAYER_LEFT, lobbyLeaveRequest);
    this.unsubscribeLobbyEvents();
    this.lobby$.next(null);
  }

  private subToLobbyEvents(): void {
    this.getLobbyEvent$().subscribe({
      next: lobby => this.lobby$.next(new Lobby(lobby.id, lobby.createdAt, lobby.members)),
      complete: () => this.unsubscribeLobbyEvent(),
    });

    this.lobbyPlayerJoinedSub = this.getLobbyPlayerJoinedEvents$().subscribe(
      {
        next: lobbyPlayerJoinedEvent => {
          const lobby = this.getLobby();
          lobby.addPlayer(lobbyPlayerJoinedEvent.player);
          this.lobby$.next(lobby);
        },
        complete: () => this.unsubscribeLobbyPlayerJoinedEvents(),
      }
    );

    this.lobbyPlayerLeftSub = this.getLobbyPlayerLeftEvents$().subscribe(
      {
        next: lobbyPlayerLeftEvent => {
          const lobby = this.getLobby();
          lobby.removePlayer(lobbyPlayerLeftEvent.player);
          this.lobby$.next(lobby);
        },
        complete: () => this.unsubscribeLobbyPlayerLeftEvents(),
      }
    );

    this.lobbyConsumedSub = this.getLobbyConsumedEvent$().subscribe(
      {
        next: lobbyConsumedEvent => {
          this.lobby$.next(null);
          this.unsubscribeLobbyEvents();
          //lobbyConsumedEvent.game todo

        },
        complete: () => this.unsubscribeLobbyConsumedEvent(),
      },
    );
  }

  private unsubscribeLobbyEvents(): void {
    try {
      if (this.lobbyPlayerJoinedSub) {
        this.lobbyPlayerJoinedSub.unsubscribe();
        this.unsubscribeLobbyPlayerJoinedEvents();
      }
      if (this.lobbyPlayerLeftSub) {
        this.lobbyPlayerLeftSub.unsubscribe();
        this.unsubscribeLobbyPlayerLeftEvents();
      }
      if (this.lobbyConsumedSub) {
        this.lobbyConsumedSub.unsubscribe();
        this.unsubscribeLobbyConsumedEvent();
      }
    } catch (err) {
      console.warn(err);
    }
  }

  public getLobby$(): Observable<Lobby | null> {
    return this.lobby$.asObservable();
  }

  public getLobby(): Lobby | null {
    return this.lobby$.value;
  }

  private getLobbyEvent$(): Observable<Lobby> {
    return this.lobbyConnection.getMessages$<Lobby>(LobbyEvents.GET_LOBBY).pipe(
      first(),
    );
  }

  private unsubscribeLobbyEvent(): void {
    this.lobbyConnection.unsubscribeEvent(LobbyEvents.GET_LOBBY);
  }

  public getLobbyPlayerLeftEvents$(): Observable<LobbyPlayerLeftEvent> {
    return this.lobbyConnection.getMessages$<LobbyPlayerLeftEvent>(LobbyEvents.PLAYER_LEFT);
  }

  public unsubscribeLobbyPlayerLeftEvents(): void {
    this.lobbyConnection.unsubscribeEvent(LobbyEvents.PLAYER_LEFT);
  }

  public getLobbyPlayerJoinedEvents$(): Observable<LobbyPlayerJoinedEvent> {
    return this.lobbyConnection.getMessages$<LobbyPlayerJoinedEvent>(LobbyEvents.PLAYER_JOINED);
  }

  public unsubscribeLobbyPlayerJoinedEvents(): void {
    this.lobbyConnection.unsubscribeEvent(LobbyEvents.PLAYER_JOINED);
  }

  public getLobbyConsumedEvent$(): Observable<LobbyConsumedEvent> {
    return this.lobbyConnection.getMessages$<LobbyConsumedEvent>(LobbyEvents.CONSUMED).pipe(
      first(),
    );
  }

  public unsubscribeLobbyConsumedEvent(): void {
    this.lobbyConnection.unsubscribeEvent(LobbyEvents.CONSUMED);
  }

  public close(): void {
    this.lobbyConnection.close();
    this.lobby$.next(null);
    this.lobbyConnection = null;
  }
}
