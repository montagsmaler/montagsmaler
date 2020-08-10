import { Component, OnInit } from '@angular/core';
import {
  trigger,
  query,
  animateChild,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

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
export class GameComponent implements OnInit {
  boolCountdown: boolean = false;
  boolGameStarted: boolean = true;
  counter: number = 3;
  interval;

  constructor() {}

  ngOnInit() {}

  showCountdown(event) {
    this.boolCountdown = true;
    this.startCountdown();
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
    this.boolGameStarted = true;
    this.startCountdown();
  }
}
