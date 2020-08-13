import { Component, OnInit, OnDestroy } from '@angular/core';
import { LobbyService } from 'src/app/api/ws/lobby';
import { Subscription, Subject, from, of, Observable } from 'rxjs';
import { Lobby } from 'src/app/api/ws/lobby/models';
import { ActivatedRoute } from '@angular/router';
import { map, filter, switchMap, first } from 'rxjs/internal/operators';

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.scss'],
})
export class CreateLobbyComponent implements OnInit, OnDestroy {
  create: boolean = false;
  name: string = '';
  private readonly lobbySubscriptions = new Set<Subscription>();
  public readonly lobby$ = new Subject<Lobby>();

  constructor(private readonly lobbyService: LobbyService, private readonly activatedRoute: ActivatedRoute) { }

  /**
   *
   */
  ngOnInit(): void {
    const lobby = this.lobbyService.getLobby();
    const lobbyId$: Observable<string> = this.activatedRoute.params.pipe(
      map(params => params.lobbyId),
      filter(id => (id) ? true : false),
      first(),
    );
    lobbyId$
      .pipe(
        switchMap(id => {
          if (!lobby || lobby.id !== id) {
            return from(this.joinLobby(id));
          } else {
            return of(undefined);
          }
        }),
      )
      .subscribe(() => {
        //you have joined the lobby
        this.subToLobbyEvents();
      });
  }

  ngOnDestroy(): void {
    this.leaveLobby().finally(() => {
      this.unsubLobbyEvents();
      this.lobbyService.disconnect();
    });
  }

  createLobby() {
    this.lobbyService.createLobby();
    this.subToLobbyEvents();
    this.create = true;
  }

  async joinLobby(lobbyId: string) {
    await this.lobbyService.joinLobby(lobbyId);
    this.subToLobbyEvents();
  }

  private subToLobbyEvents() {
    const lobbySub = this.lobbyService.getLobby$().subscribe(this.lobby$);
    this.lobbySubscriptions.add(lobbySub);
    const lobbyConsumedSub = this.lobbyService.getLobbyConsumedEvent$().subscribe(lobbyConsumedEvent => {
      console.log(lobbyConsumedEvent);
      //trigger logic to start game
    });
    this.lobbySubscriptions.add(lobbyConsumedSub);
  }

  private unsubLobbyEvents() {
    this.lobbySubscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private async leaveLobby() {
    await this.lobbyService.leaveLobby();
  }

  cancel(event) {
    this.create = false;
  }

  onKey(value: string) {
    this.name = value;
  }
}
