import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from './http';
import { WsModule } from './ws';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpModule,
    WsModule,
  ],
  exports: [
    HttpModule,
    WsModule,
  ]
})
export class ApiModule { }
