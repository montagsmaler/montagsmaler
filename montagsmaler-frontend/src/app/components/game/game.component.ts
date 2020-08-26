import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, query, animateChild, transition } from '@angular/animations';
import { GameService } from 'src/app/api/ws/game';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, first, tap } from 'rxjs/internal/operators';
import { Subscription, Subject, from, Observable } from 'rxjs';
import { Game } from 'src/app/api/ws/game/models';
import { AuthService, User } from 'src/app/api/http/auth';
import { DrawCanvasComponent } from './draw-canvas/draw-canvas.component';
import { firstNonNil } from 'src/app/utility/rxjs/operator';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger('ngIfAnimation', [
      transition(':enter, :leave', [query('@*', animateChild())]),
    ]),
  ],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild(DrawCanvasComponent, { static: false }) canvas;

  private readonly gameSubscriptions = new Set<Subscription>();
  public readonly game$ = new Subject<Game>();
  public currentRound: number;
  public currentWord: string;
  public currentPlayer: User;
  showCountdown = true;
  roundOver = false;
  gameOver = false;
  gameStarted = false;
  counter = 3;
  interval;
  gameId: string;

  constructor(
    private readonly gameService: GameService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    const gameId$: Observable<string> = this.authService
      .getLoggedInUser$()
      .pipe(
        firstNonNil(),
        switchMap((user) => {
          this.currentPlayer = user;
          return this.activatedRoute.params;
        }),
        map((params) => params.gameId),
        firstNonNil()
      );
    gameId$
      .pipe(
        tap((id) => (this.gameId = id)),
        switchMap((id) => from(this.gameService.joinGame(id))),
        switchMap(() => this.gameService.getGame$()),
        first()
      )
      .subscribe((game) => {
        this.game$.next(game);
        this.subscribeGameEvents();
      });
  }

  private subscribeGameEvents() {
    const gameStartedEventSub = this.gameService
      .getGameStartedEvent$()
      .subscribe((gameStartedEvent) => {
        this.startCountdown();
        this.gameStarted = true;
        console.log(gameStartedEvent);
      });
    this.gameSubscriptions.add(gameStartedEventSub);

    const newGameRoundEventSub = this.gameService
      .getNewGameRoundEvent$()
      .subscribe((newGameRoundEvent) => {
        this.gameStarted = true;

        this.roundOver = false;
        this.currentRound = newGameRoundEvent.round;
        this.currentWord = newGameRoundEvent.noun;
        this.canvas.clear();
        console.log(newGameRoundEvent);
      });
    this.gameSubscriptions.add(newGameRoundEventSub);

    const gameImageAddedEventSub = this.gameService
      .getGameImageAddedEvent$()
      .subscribe(console.log);
    this.gameSubscriptions.add(gameImageAddedEventSub);

    const gameImagesShouldPublishEvent = this.gameService
      .getGameImagesShouldPublishEvent$()
      .subscribe((imageSubmitEvent) => {
        this.submitImage();
        console.log(imageSubmitEvent);
      });
    this.gameSubscriptions.add(gameImagesShouldPublishEvent);

    const gameRoundOverEventSub = this.gameService
      .getGameRoundOverEvent$()
      .subscribe((gameRoundOverEvent) => {
        this.gameStarted = true;

        this.roundOver = true;
        this.currentWord = null;
        this.startCountdown();
        console.log(gameRoundOverEvent);
      });
    this.gameSubscriptions.add(gameRoundOverEventSub);

    const gameOverEventSub = this.gameService
      .getGameOverEvent$()
      .subscribe((gameOverEvent) => {
        this.gameStarted = true;

        this.roundOver = false;
        this.gameOver = true;
        console.log(gameOverEvent);

        this.counter = 3;
        this.interval = setInterval(() => {
          if (this.counter > 0) {
            this.counter--;
          } else {
            this.router.navigate(['/result/', this.gameId], {state: { data: gameOverEvent.images },});
            clearInterval(this.interval);
          }
        }, 1000);

      });
    this.gameSubscriptions.add(gameOverEventSub);
  }

  ngOnDestroy() {
    this.unsubscribeGameEvents();
    this.gameService.disconnect();
  }

  private unsubscribeGameEvents() {
    this.gameSubscriptions.forEach((subscription) =>
      subscription.unsubscribe()
    );
  }

  submitImage() {
    this.gameService
      .getSubmitImage$()
      .pipe(first())
      .subscribe((image) => {
        this.gameService.publishImage({
          imageBase64: image,
          gameId: this.gameId,
          forRound: this.currentRound,
        });
      });
    this.gameService.imageShouldSubmit();
  }

  startCountdown() {
    this.showCountdown = true;

    this.counter = 3;
    this.interval = setInterval(() => {
      if (this.counter > 0) {
        this.counter--;
      } else {
        this.showCountdown = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
