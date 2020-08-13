import { Component, OnInit, Input } from '@angular/core';
import { getRandomColor, hashCodeFromString } from '../../../utility/utility.js';


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

  getRandomColor(uuid: string) {
    return getRandomColor(hashCodeFromString(uuid));
  }
}
