import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, query, animateChild, transition, state, style, animate } from '@angular/animations';
import { GameService } from 'src/app/api/ws/game';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, first, tap } from 'rxjs/internal/operators';
import { Subscription, Subject, from, Observable } from 'rxjs';
import { Game } from 'src/app/api/ws/game/models';
import { AuthService, User } from 'src/app/api/http/auth';
import { DrawCanvasComponent } from './draw-canvas/draw-canvas.component';
import { firstNonNil } from 'src/app/utility/rxjs/operator';
import { ToastData } from './toast/toast.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger('ngIfAnimation', [
      transition(':enter, :leave', [query('@*', animateChild())]),
    ]),
    // trigger('flyInOut', [
    //   state('in', style({ transform: 'translateX(0)' })),
    //   transition('void => *', [
    //     style({ transform: 'translateX(-100%)' }),
    //     animate(100),
    //   ]),
    //   transition('* => void', [
    //     animate(100, style({ transform: 'translateX(100%)' })),
    //   ]),
    // ]),
    // trigger('myInsertRemoveTrigger', [
    //   transition(':enter', [
    //     style({ opacity: 0 }),
    //     animate('100ms', style({ opacity: 1 })),
    //   ]),
    //   transition(':leave', [animate('100ms', style({ opacity: 0 }))]),
    // ]),
  ],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild(DrawCanvasComponent, { static: false }) canvas;

  private readonly gameSubscriptions = new Set<Subscription>();
  public readonly game$ = new Subject<Game>();
  public currentRound: number;
  public currentWord: string;
  public currentPlayer: User;
  showCurtain = true;
  showCountdown = true;
  roundOver = false;
  gameOver = false;
  imageSubmitted = false;
  gameStarted = false;
  counter = 3;
  interval;
  gameId: string;
  toasts: [ToastData];

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
        console.log(this.toasts);

        console.log(newGameRoundEvent);
      });
    this.gameSubscriptions.add(newGameRoundEventSub);

    const gameImageAddedEventSub = this.gameService
      .getGameImageAddedEvent$()
      .subscribe((gameImageAddedEvent) => {
        this.showToast({
          text:
            gameImageAddedEvent.image.player.name +
            ' hat bereits sein Bild gepostet',
        });
        console.log(gameImageAddedEvent);
      });
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
        this.showCountdown = false;
        this.gameOver = true;
        console.log(gameOverEvent);

        setTimeout(
          () =>
            this.router.navigate(['/result/', this.gameId], {
              state: { data: gameOverEvent.images },
            }),
          3000
        );
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

  showToast(data: ToastData) {
    if (this.toasts === undefined) {
      this.toasts = [data];
    } else {
      this.toasts.push(data);
    }

    setTimeout(() => this.toasts.shift(), 5000);
  }

  shouldSubmitImage() {
      this.showCountdown = false;
      this.imageSubmitted = true;
      this.showCurtain = true;

      this.submitImage();
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
    this.showCurtain = true;
    this.imageSubmitted = false;

    this.counter = 3;
    this.interval = setInterval(() => {
      if (this.counter > 0) {
        this.counter--;
      } else {
        this.showCurtain = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
