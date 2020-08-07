import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyModule } from './lobby';
import { GameModule } from './game';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LobbyModule,
    GameModule,
  ]
})
export class WsModule { }
