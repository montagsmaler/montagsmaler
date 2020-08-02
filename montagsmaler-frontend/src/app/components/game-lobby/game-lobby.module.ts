import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameLobbyComponent } from './game-lobby.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LobbyItemComponent } from './lobby-item/lobby-item.component';
import { MatGridListModule } from "@angular/material/grid-list";


@NgModule({
  declarations: [GameLobbyComponent, LobbyItemComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
  ],
})
export class GameLobbyModule {}
