import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameResultComponent } from './game-result.component';
import { RouterModule } from '@angular/router';
import { ResultImageComponent } from './result-image/result-image.component';
import { SlickCarouselModule } from "ngx-slick-carousel";


@NgModule({
  declarations: [GameResultComponent, ResultImageComponent],
  imports: [CommonModule, RouterModule, SlickCarouselModule],
})
export class GameResultModule {}
