import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"],
  animations: [
    trigger("enterAnimation", [
      transition(":enter", [
        style({ transform: "translateX(100%)", opacity: 0 }),
        animate("500ms", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
      transition(":leave", [
        style({ transform: "translateX(0)", opacity: 1 }),
        animate("500ms", style({ transform: "translateX(100%)", opacity: 0 })),
      ]),
    ]),
  ],
})
export class GameComponent implements OnInit {
  boolCountdown: boolean = false;
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
}
