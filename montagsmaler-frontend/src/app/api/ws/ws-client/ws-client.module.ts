import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsClientService } from './service/ws-client.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    WsClientService,
  ]
})
export class WsClientModule { }
