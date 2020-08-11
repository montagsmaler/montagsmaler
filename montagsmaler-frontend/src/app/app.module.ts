import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CompontentsModule } from './components/compontents.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { authInterceptorProvider } from './api/http/auth';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CompontentsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    authInterceptorProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
