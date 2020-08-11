import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { WelcomeModule } from './welcome/welcome.module';
import { GameLobbyModule } from './game-lobby/game-lobby.module';
import { GameModule } from './game/game.module';
import { GameComponent } from './game/game.component';

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    WelcomeModule,
    GameLobbyModule,
    GameModule,
  ]
})
export class CompontentsModule {}
