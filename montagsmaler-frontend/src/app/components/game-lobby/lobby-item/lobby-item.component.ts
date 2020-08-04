import { Component, OnInit, Input } from '@angular/core';
import { getRandomColor } from '../../../utility/utility.js';

@Component({
  selector: 'app-lobby-item',
  templateUrl: './lobby-item.component.html',
  styleUrls: ['./lobby-item.component.scss'],
})
export class LobbyItemComponent implements OnInit {
  @Input() game: number;

  constructor() {}

  ngOnInit() {}

  getRandomImage(inputNumber: number) {
    const random = inputNumber % 7;
    switch (random) {
      case 0:
        return 'sun';
      case 1:
        return 'sun';
      case 2:
        return 'sun';
      case 3:
        return 'sun';
      case 4:
        return 'sun';
      case 5:
        return 'sun';
      case 6:
        return 'sun';
    }
  }

  getRandomColor(inputNumber: number) {
    return getRandomColor(inputNumber);
  }
}
