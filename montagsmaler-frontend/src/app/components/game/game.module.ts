import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameComponent } from './game.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountdownComponent } from './countdown/countdown.component';
import { WaitForPlayersComponent } from './wait-for-players/wait-for-players.component';
import { PlayerItemComponent } from './wait-for-players/player-item/player-item.component';


@NgModule({
  declarations: [GameComponent, CountdownComponent, WaitForPlayersComponent, PlayerItemComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class GameModule {}
