import { Injectable } from '@angular/core';
import { WsClientService, IWsConnection } from '../../ws-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game, GameEvents } from '../models';
import { filter, first, tap } from 'rxjs/internal/operators';
import { GameImagePublishRequest, IGameImagePublishRequest, GameJoinRequest } from '../models/requests';
import { GameImageAddedEvent, GameImagesShouldPublishEvent, GameRoundOverEvent, NewGameRoundEvent, GameStartedEvent, GameOverEvent } from '../models/events';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly namespace = 'game';
  private gameConnection: IWsConnection | null = null;
  private readonly game$ = new BehaviorSubject<Game | null>(null);

  constructor(private readonly wsClient: WsClientService) { }

  private connect(): void {
    if (!this.gameConnection) {
      this.gameConnection = this.wsClient.getConnectionForNamespace(this.namespace);
    }
  }

  public getGame$(): Observable<Game> {
    return this.game$.pipe(
      filter(game => (game) ? true : false),
      first(),
    );
  }

  public getGame(): Game | null {
    return this.game$.value;
  }

  public async joinGame(gameId: string): Promise<void> {
    const gameJoinRequest = await GameJoinRequest.fromObject({ gameId });
    this.connect();
    this.subscribeToGameEvents();
    this.gameConnection.sendMessage(GameEvents.JOIN_GAME, gameJoinRequest);
  }

  public async publishImage(imagePublishRequest: IGameImagePublishRequest): Promise<void> {
    this.gameConnection.sendMessage(GameEvents.PUBLISH_IMAGE, await GameImagePublishRequest.fromObject(imagePublishRequest));
  }

  private getGameEvent$(): Observable<Game> {
    return this.gameConnection.getMessages$<Game>(GameEvents.GET_GAME).pipe(
      first(),
    );
  }

  public getGameImageAddedEvent$(): Observable<GameImageAddedEvent> {
    return this.gameConnection.getMessages$<GameImageAddedEvent>(GameEvents.IMAGE_ADDED);
  }

  public getGameImagesShouldPublishEvent$(): Observable<GameImagesShouldPublishEvent> {
    return this.gameConnection.getMessages$<GameImagesShouldPublishEvent>(GameEvents.IMAGES_SHOULD_PUBLISH);
  }

  public getGameRoundOverEvent$(): Observable<GameRoundOverEvent> {
    return this.gameConnection.getMessages$<GameRoundOverEvent>(GameEvents.ROUND_OVER);
  }

  public getNewGameRoundEvent$(): Observable<NewGameRoundEvent> {
    return this.gameConnection.getMessages$<NewGameRoundEvent>(GameEvents.ROUND_STARTED);
  }

  public getGameStartedEvent$(): Observable<GameStartedEvent> {
    return this.gameConnection.getMessages$<GameStartedEvent>(GameEvents.GAME_STARTED);
  }

  public getGameOverEvent$(): Observable<GameOverEvent> {
    return this.gameConnection.getMessages$<GameOverEvent>(GameEvents.GAME_OVER).pipe(
      first(),
      tap(() => this.disconnect()),
    );
  }

  private subscribeToGameEvents() {
    this.getGameEvent$().subscribe(game => this.game$.next(new Game(game.id, game.createdAt, game.players, game.durationRound, game.rounds)));
  }

  public disconnect(): void {
    try {
      this.game$.next(null);
      this.gameConnection.disconnect();
      this.gameConnection = null;
    } catch (err) {
      console.warn(err);
    }
  }
}
