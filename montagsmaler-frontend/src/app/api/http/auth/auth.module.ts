import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './service/auth.service';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
  ],
  exports: [
  ],
})
export class AuthModule { }
