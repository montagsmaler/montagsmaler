import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerItemComponent } from "./player-item/player-item.component";
import { GameLobbyComponent } from './game-lobby.component';

@NgModule({
  declarations: [PlayerItemComponent, GameLobbyComponent],
  imports: [CommonModule],
})
export class GameLobbyModule {}
