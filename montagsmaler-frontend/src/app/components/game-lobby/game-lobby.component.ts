import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss']
})
export class GameLobbyComponent implements OnInit {

  games = [0, 1, 2, 3, 4];
  constructor() { }

  ngOnInit() {
  }

}
