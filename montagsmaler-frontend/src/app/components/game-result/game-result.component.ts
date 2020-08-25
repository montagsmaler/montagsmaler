import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: "app-game-result",
  templateUrl: "./game-result.component.html",
  styleUrls: ["./game-result.component.scss"],
})
export class GameResultComponent implements OnInit {
  images = [
    {
      createdAt: 1598356612161,
      id: "daa9c490-8738-47eb-beb8-80eb4912491c",
      imageUrl:
        "https://montagsmaler-niklas.s3.amazonaws.com/daa9c490-8738-47eb-beb8-80eb4912491c.jpg",
      player: {
        id: "9933fa9d-a011-4a74-829d-b9998b26c58a",
        name: "niki",
        __className: "Player",
      },
      round: 1,
      score: 0,
    },
    {
      createdAt: 1598356612161,
      id: "e713e2b3-4a5f-4306-95b8-9fd2ef1d916b",
      imageUrl:
        "https://montagsmaler-niklas.s3.amazonaws.com/e713e2b3-4a5f-4306-95b8-9fd2ef1d916b.jpg",
      player: {
        id: "9933fa9d-a011-4a74-829d-b9998b26c58a",
        name: "niki",
        __className: "Player",
      },
      round: 2,
      score: 0,
    },
    {
      createdAt: 1598356676981,
      id: "b537aa0a-c876-49d8-a53b-380d66e73d82",
      imageUrl:
        "https://montagsmaler-niklas.s3.amazonaws.com/b537aa0a-c876-49d8-a53b-380d66e73d82.jpg",
      player: {
        id: "9933fa9d-a011-4a74-829d-b9998b26c58a",
        name: "niki",
        __className: "Player",
      },
      round: 3,
      score: 0,
    },
  ];
  rounds = 0;
  imagesPerRound = [];


  constructor() {}

  ngOnInit() {
    this.rounds = this.getMaxRound();
    // this.imagesPerRound = this.getImagesPerRound();
  }

  getMaxRound() {
    let maxRound = 0;
    this.images.forEach((image) => {
      if (image.round > maxRound) {
        maxRound = image.round;
      }
    });
    return maxRound;
  }

  getImagesPerRound() {
    // var imagesPer
  }
}
