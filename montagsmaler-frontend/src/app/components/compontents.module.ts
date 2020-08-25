import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { WelcomeModule } from './welcome/welcome.module';
import { GameHomeModule } from './game-home/game-home.module';
import { GameModule } from './game/game.module';
import { GameLobbyModule } from './game-lobby/game-lobby.module';
import { GameResultModule } from './game-result/game-result.module';

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    WelcomeModule,
    GameHomeModule,
    GameModule,
    GameLobbyModule,
    GameResultModule,
  ]
})
export class CompontentsModule {}
