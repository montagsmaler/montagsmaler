import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameComponent } from './game.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountdownComponent } from './countdown/countdown.component';
import { DrawCanvasComponent } from './draw-canvas/draw-canvas.component';

@NgModule({
  declarations: [
    GameComponent,
    CountdownComponent,
    DrawCanvasComponent,
  ],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
})
export class GameModule {}
