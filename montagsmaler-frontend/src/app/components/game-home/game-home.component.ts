import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-home',
  templateUrl: './game-home.component.html',
  styleUrls: ['./game-home.component.scss']
})
export class GameHomeComponent implements OnInit {

  games = [1, 2];
  constructor() { }

  ngOnInit() {
  }

}
