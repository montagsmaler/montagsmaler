import { Component, OnInit, Input } from '@angular/core';
import { getRandomColor } from '../../../utility/utility.js';


@Component({
  selector: 'app-player-item',
  templateUrl: './player-item.component.html',
  styleUrls: ['./player-item.component.scss'],
})
export class PlayerItemComponent implements OnInit {
  @Input() empty: boolean;
  @Input() name: string;
  @Input() playerId: number;

  constructor() {}

  ngOnInit() {}

  generateHashFromString(str: string): number {
    let hash = 0, i, chr;
    for (i = 0; i < 10; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    if (hash < 0) {
      hash *= -1;
    }
    return hash;
  }

  getRandomColor(id: string) {
    const hash = this.generateHashFromString(id);
    return getRandomColor(hash);
  }
}
