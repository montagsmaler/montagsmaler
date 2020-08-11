import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyModule } from './lobby';
import { GameModule } from './game';
import { WsClientModule } from './ws-client';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    WsClientModule,
    LobbyModule,
    GameModule,
  ]
})
export class WsModule { }
