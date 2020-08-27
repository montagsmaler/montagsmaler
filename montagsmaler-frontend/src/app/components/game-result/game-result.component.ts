import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-game-result',
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0.3 }),
        animate('400ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('400ms', style({ opacity: 0 })),
      ]),
    ]),
  ]
})

export class GameResultComponent implements OnInit {
  images;
  rounds = 0;
  imagesPerRound = [];
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: false,
    arrow: false,
    nextArrow: '<div></div>',
    prevArrow: '<div></div>',
  };

  @ViewChild('slickModal', { static: true }) slickModal: SlickCarouselComponent;

  constructor() {}

  ngOnInit() {
    this.images = history.state.data;
    this.rounds = this.getMaxRound();

    for (let i = 1; i <= this.rounds; i++) {
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

  getIndexOfRound(round) {}

  addSlide() {}

  removeSlide() {}

  slickInit(e) {}

  breakpoint(e) {}

  afterChange(e) {}

  beforeChange(e) {}

  next() {
    this.slickModal.slickNext();
  }
  prev() {
    this.slickModal.slickPrev();
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
}
