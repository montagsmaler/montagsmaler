import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  trigger,
  query,
  animateChild,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { GameService } from 'src/app/api/ws/game';
import { ActivatedRoute } from '@angular/router';
import { map, filter, switchMap, first, tap } from 'rxjs/internal/operators';
import { Subscription, Subject, from, Observable } from 'rxjs';
import { Game } from 'src/app/api/ws/game/models';

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
  boolCountdown: boolean = false;
  counter: number = 3;
  interval;
  public readonly game$ = new Subject<Game>();
  private readonly gameSubscriptions = new Set<Subscription>();
  gameId: string;

  constructor(private readonly gameService: GameService, private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    const gameId$: Observable<string> = this.activatedRoute.params.pipe(
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
      this.startGame();
      this.game$.next(game);
      this.subscribeGameEvents();
    });
  }

  private subscribeGameEvents() {
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
      this.gameService.publishImage({ imageBase64: image, gameId: this.gameId, forRound: 0 });
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
