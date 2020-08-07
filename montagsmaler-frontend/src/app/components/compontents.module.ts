import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { WelcomeModule } from './welcome/welcome.module';
import { GameLobbyModule } from './game-lobby/game-lobby.module';

@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    WelcomeModule,
    GameLobbyModule,
  ]
})
export class CompontentsModule { }
