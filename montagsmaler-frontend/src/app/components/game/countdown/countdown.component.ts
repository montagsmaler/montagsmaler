import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";

@Component({
  selector: "app-countdown",
  templateUrl: "./countdown.component.html",
  styleUrls: ["./countdown.component.scss"],
  animations: [
    trigger("enterAnimation", [
      transition(":enter", [
        style({ transform: "translateY(-100%)" }),
        animate("500ms ease-in", style({ transform: "translateY(0)" })),
      ]),
      transition(":leave", [
        style({ transform: "translateY(0)", opacity: 1 }),
        animate("500ms", style({ transform: "translateY(-100%)" })),
      ]),
    ]),
  ],
})
export class CountdownComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
