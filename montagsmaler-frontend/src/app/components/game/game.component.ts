import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, query, animateChild, transition } from '@angular/animations';
import { GameService } from 'src/app/api/ws/game';
import { ActivatedRoute } from '@angular/router';
import { map, filter, switchMap, first, tap } from 'rxjs/internal/operators';
import { Subscription, Subject, from, Observable } from 'rxjs';
import { Game } from 'src/app/api/ws/game/models';
import { AuthService, User } from 'src/app/api/http/auth';

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
  private readonly gameSubscriptions = new Set<Subscription>();
  public readonly game$ = new Subject<Game>();
  public currentRound: number;
  public currentWord: string;
  public currentPlayer: User;
  boolCountdown = false;
  roundOver = false;
  gameOver = false;
  counter = 3;
  interval;
  gameId: string;

  constructor(
    private readonly gameService: GameService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
    ) {}

  ngOnInit() {
    const gameId$: Observable<string> = this.authService.getLoggedInUser$().pipe(
      filter(user => (user) ? true : false),
      first(),
      switchMap(user => {
        this.currentPlayer = user;
        return this.activatedRoute.params;
      }),
      map(params => params.gameId),
      filter(id => (id) ? true : false),
      first(),
    );
    gameId$.pipe(
      tap(id => this.gameId = id),
      switchMap(id => from(this.gameService.joinGame(id))),
      switchMap(() => this.gameService.getGame$()),
      first(),
    ).subscribe(game => {
      this.game$.next(game);
      this.subscribeGameEvents();
    });
  }

  private subscribeGameEvents() {
    const gameStartedEventSub = this.gameService.getGameStartedEvent$().subscribe(gameStartedEvent => {
      this.startGame();
      console.log(gameStartedEvent);
    });
    this.gameSubscriptions.add(gameStartedEventSub);
    const newGameRoundEventSub = this.gameService.getNewGameRoundEvent$().subscribe(newGameRoundEvent => {
      this.roundOver = false;
      this.currentRound = newGameRoundEvent.round;
      this.currentWord = newGameRoundEvent.noun;
      console.log(newGameRoundEvent);
    });
    this.gameSubscriptions.add(newGameRoundEventSub);
    const gameImageAddedEventSub = this.gameService.getGameImageAddedEvent$().subscribe(console.log);
    this.gameSubscriptions.add(gameImageAddedEventSub);
    const imageShouldSubmitSub = this.gameService.getImageShouldSubmit$().subscribe(console.log);
    this.gameSubscriptions.add(imageShouldSubmitSub);
    const gameRoundOverEventSub = this.gameService.getGameRoundOverEvent$().subscribe(gameRoundOverEvent => {
      this.roundOver = true;
      this.currentWord = null;
      console.log(gameRoundOverEvent);
    });
    this.gameSubscriptions.add(gameRoundOverEventSub);
    const gameOverEventSub = this.gameService.getGameOverEvent$().subscribe(gameOverEvent => {
      this.roundOver = false;
      this.gameOver = true;
      console.log(gameOverEvent);
    });
    this.gameSubscriptions.add(gameOverEventSub);
  }

  ngOnDestroy() {
    this.unsubscribeGameEvents();
    this.gameService.disconnect();
  }

  private unsubscribeGameEvents() {
    this.gameSubscriptions.forEach(subscription => subscription.unsubscribe());
  }

  submitImage() {
    this.gameService.getSubmitImage$().pipe(
      first(),
    ).subscribe(image => {
      this.gameService.publishImage({ imageBase64: image, gameId: this.gameId, forRound: this.currentRound });
    });
    this.gameService.imageShouldSubmit();
  }

  startCountdown() {
    this.counter = 3;
    this.interval = setInterval(() => {
      if (this.counter > 0) {
        this.counter--;
      } else {
        this.boolCountdown = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  startGame() {
    this.boolCountdown = true;
    this.startCountdown();
  }
}
