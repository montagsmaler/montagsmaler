import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameHomeComponent } from './game-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LobbyItemComponent } from './lobby-item/lobby-item.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { CreateLobbyComponent } from './create-lobby/create-lobby.component';


@NgModule({
  declarations: [GameHomeComponent, LobbyItemComponent, CreateLobbyComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
  ],
})
export class GameHomeModule {}
