import { Component, OnInit, Input } from '@angular/core';
import { PageSliderModule } from "ng2-page-slider";



@Component({
  selector: "app-game-result",
  templateUrl: "./game-result.component.html",
  styleUrls: ["./game-result.component.scss"],
})
export class GameResultComponent implements OnInit {
  images;
  rounds = 0;
  imagesPerRound = [];
  slideConfig = { slidesToShow: 1, slidesToScroll: 1 };

  constructor() {}

  ngOnInit() {
    this.images = history.state.data;
    this.rounds = this.getMaxRound();

    for (let i = 1; (i <= this.rounds); i++) {
      this.imagesPerRound[i - 1] = [];
      console.log(i);
      this.images.forEach((image) => {
        if (image.round === i) {
          this.imagesPerRound[i - 1].push(image);
        }
      });
    }
    console.log(this.imagesPerRound);
  }

  getIndexOfRound(round) {

  }

  addSlide() {}

  removeSlide() {}

  slickInit(e) {
  }

  breakpoint(e) {
  }

  afterChange(e) {
  }

  beforeChange(e) {
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
