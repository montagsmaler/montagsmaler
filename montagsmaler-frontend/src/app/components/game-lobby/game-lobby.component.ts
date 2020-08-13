import { Component, OnInit } from '@angular/core';
import { LobbyService } from 'src/app/api/ws/lobby';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";


@Component({
  selector: "app-game-home",
  templateUrl: "./game-lobby.component.html",
  styleUrls: ["./game-lobby.component.scss"],
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
export class GameLobbyComponent implements OnInit {
  constructor(private readonly lobbyService: LobbyService) {}

  ngOnInit() {}
}
