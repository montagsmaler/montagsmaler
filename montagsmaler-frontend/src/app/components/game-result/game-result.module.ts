import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameResultComponent } from './game-result.component';
import { RouterModule } from '@angular/router';
import { ResultImageComponent } from './result-image/result-image.component';




@NgModule({
  declarations: [GameResultComponent, ResultImageComponent],
  imports: [CommonModule, RouterModule],
})
export class GameResultModule {}
