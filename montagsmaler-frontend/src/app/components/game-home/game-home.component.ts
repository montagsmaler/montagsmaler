import { Component, OnInit } from '@angular/core';
import { LobbyService } from 'src/app/api/ws/lobby';

@Component({
  selector: 'app-game-home',
  templateUrl: './game-home.component.html',
  styleUrls: ['./game-home.component.scss']
})
export class GameHomeComponent implements OnInit {

  constructor(private readonly lobbyService: LobbyService) { }

  ngOnInit() {
  }

}
