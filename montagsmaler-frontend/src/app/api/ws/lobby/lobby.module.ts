import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyService } from './service/lobby.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    LobbyService,
  ],
  exports: [
    LobbyService,
  ],
})
export class LobbyModule { }
