import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'welcome',
        pathMatch: 'full',
      },
      {
        path: 'welcome',
        component: WelcomeComponent,
      },
      { path: 'lobby',
        component: GameLobbyComponent
      }

    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
