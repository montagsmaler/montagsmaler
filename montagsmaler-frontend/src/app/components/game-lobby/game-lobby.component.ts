import { Component, OnInit, OnDestroy } from '@angular/core';
import { LobbyService } from 'src/app/api/ws/lobby';
import { trigger, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/internal/operators';
import { Observable, from, of, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Lobby } from 'src/app/api/ws/lobby/models';
import { AuthService, User } from 'src/app/api/http/auth';
import { copyToClipboard } from 'src/app/utility/utility';
import { firstNonNil } from 'src/app/utility/rxjs/operator';

@Component({
  selector: 'app-game-home',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0.3 }),
        animate('400ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('400ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  private readonly baseUrl: string = environment.baseUrl;
  private readonly lobbySubscriptions = new Set<Subscription>();
  public lobbyUrl: string;
  public lobby: Lobby;
  public user: User;
  public isLobbyLeader = false;

  constructor(
    private readonly authService: AuthService,
    private readonly lobbyService: LobbyService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) { }

  ngOnInit() {
    const lobbyId$: Observable<string> = this.authService.getLoggedInUser$().pipe(
      firstNonNil(),
      switchMap(user => {
        this.user = user;
        return this.activatedRoute.params;
      }),
      map(params => params.lobbyId),
      firstNonNil(),
    );
    const lobby = this.lobbyService.getLobby();
    lobbyId$
      .pipe(
        switchMap(id => {
          this.lobbyUrl = `${this.baseUrl}/lobby/${id}`;
          if (!lobby || lobby.id !== id) {
            return from(this.joinLobby(id));
          } else {
            return of(null);
          }
        }),
      )
      .subscribe(() => {
        this.subToLobbyEvents();
      });
  }

  ngOnDestroy() {
    this.leaveLobby().finally(() => {
      this.unsubLobbyEvents();
      this.lobbyService.disconnect();
    });
  }

  private async leaveLobby() {
    await this.lobbyService.leaveLobby();
  }

  private async joinLobby(lobbyId: string) {
    await this.lobbyService.joinLobby(lobbyId);
    this.subToLobbyEvents();
  }

  private subToLobbyEvents() {
    const lobbySub = this.lobbyService.getLobby$().subscribe(lobby => {
      const members = lobby.members;
      if (members.length > 0 && members[0].id === this.user.id) {
        this.isLobbyLeader = true;
      }
      this.lobby = lobby;
    });
    this.lobbySubscriptions.add(lobbySub);
    const lobbyConsumedSub = this.lobbyService.getLobbyConsumedEvent$().subscribe(lobbyConsumedEvent => {
      this.router.navigate(['/game', lobbyConsumedEvent.game.id]);
    });
    this.lobbySubscriptions.add(lobbyConsumedSub);
  }

  private unsubLobbyEvents() {
    this.lobbySubscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async startGame() {
    await this.lobbyService.initGame({ lobbyId: this.lobby.id, roundDuration: 30, rounds: 3 });
  }

  copyLobbyUrlToClipboard() {
    copyToClipboard(this.lobbyUrl);
  }
}
