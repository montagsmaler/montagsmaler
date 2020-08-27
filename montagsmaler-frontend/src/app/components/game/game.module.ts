import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameComponent } from './game.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountdownComponent } from './countdown/countdown.component';
import { DrawCanvasComponent } from './draw-canvas/draw-canvas.component';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  declarations: [
    GameComponent,
    CountdownComponent,
    DrawCanvasComponent,
    LoadingScreenComponent,
    ToastComponent,
  ],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
})
export class GameModule {}
