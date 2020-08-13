import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { GameComponent } from './components/game/game.component';
import { GameHomeComponent } from './components/game-home/game-home.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'welcome',
        component: WelcomeComponent,
      },
      { path: 'home', component: GameHomeComponent },
      { path: 'lobby/:lobbyId', component: GameLobbyComponent },
      {
        path: 'game/:gameId',
        component: GameComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
