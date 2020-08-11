import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './service/game.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    GameService,
  ],
  exports: [
  ],
})
export class GameModule { }
