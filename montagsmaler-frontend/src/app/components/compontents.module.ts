import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { WelcomeModule } from './welcome/welcome.module';
import { GameHomeModule } from './game-home/game-home.module';
import { GameModule } from './game/game.module';
import { GameComponent } from './game/game.component';
import { GameLobbyComponent } from './game-lobby/game-lobby.component';
import { GameLobbyModule } from './game-lobby/game-lobby.module';

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    WelcomeModule,
    GameHomeModule,
    GameModule,
    GameLobbyModule
  ]
})
export class CompontentsModule {}
