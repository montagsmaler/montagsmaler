import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: "app-lobby-item",
  templateUrl: "./lobby-item.component.html",
  styleUrls: ["./lobby-item.component.scss"],
})
export class LobbyItemComponent implements OnInit {
  @Input() game: number;

  constructor() {}

  ngOnInit() {}

  getRandomImage(inputNumber: number) {
    const random = inputNumber % 7;
    switch (random) {
      case 0:
        return "sun";
      case 1:
        return "sun";
      case 2:
        return "sun";
      case 3:
        return "sun";
      case 4:
        return "sun";
      case 5:
        return "sun";
      case 6:
        return "sun";
    }
  }

  getRandomColor(inputNumber: number) {
    const random = inputNumber % 7;
    switch (random) {
      case 0:
        return "#00D5B9";
      case 1:
        return "#E2B236";
      case 2:
        return "#E1325B";
      case 3:
        return "#028DCB";
      case 4:
        return "#F47E4A";
      case 5:
        return "#4A86F4";
      case 6:
        return "#F48B4A";
    }
  }
}
