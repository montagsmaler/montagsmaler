import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";

@Component({
  selector: "app-wait-for-players",
  templateUrl: "./wait-for-players.component.html",
  styleUrls: ["./wait-for-players.component.scss"],
  animations: [
    trigger("enterAnimation", [
      transition(":enter", [
        style({ opacity: 0.3 }),
        animate("400ms ease-in", style({ opacity: 1 })),
      ]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate("400ms", style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class WaitForPlayersComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
