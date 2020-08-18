import { Component, OnInit, OnDestroy } from '@angular/core';
import { LobbyService } from 'src/app/api/ws/lobby';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/internal/operators';

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.scss'],
})
export class CreateLobbyComponent implements OnInit, OnDestroy {
  create: boolean = false;
  name: string = '';

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    ) { }

  /**
   *
   */
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  showCreateTextField() {
    this.create = true;
  }

  createLobby() {
    this.lobbyService.getLobby$().pipe(
      first(),
    ).subscribe(lobby => this.router.navigate(['/lobby/', lobby.id ]));
    this.lobbyService.createLobby();
  }

  cancel(event) {
    this.create = false;
  }

  onKey(value: string) {
    this.name = value;
  }
}
