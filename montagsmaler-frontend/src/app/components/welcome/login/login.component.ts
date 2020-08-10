import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, ILoginRequest } from 'src/app/api/http/auth';
import { LobbyService } from 'src/app/api/ws/lobby';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() stateChanges = new EventEmitter();

  loginForm: FormGroup;
  joinLobbyForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly lobbyService: LobbyService,
  ) {
    this.loginForm = this.formBuilder.group({
      name: '',
      password: ''
    });

    this.joinLobbyForm = this.formBuilder.group({
      lobbyId: '',
    });
  }

  ngOnInit() {
    this.authService.getLoggedInUser$().subscribe(console.log);
    this.authService.getCognitoUser().then(console.log).catch(console.warn);
    this.authService.getCognitoUser().then(console.log).catch(console.warn);
    this.lobbyService.getLobby$().subscribe(console.log);
  }

  switch() {
    this.stateChanges.emit(false);
  }

  async onSubmit(value: ILoginRequest) {
    try {
      await this.authService.login(value);
    } catch (err) {
      //display err
      console.error(err);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (err) {
      console.warn(err);
    }
  }

  joinLobby(value) {
    this.lobbyService.initCon();
    this.lobbyService.joinLobby(value.lobbyId);
  }

  createLobby() {
    this.lobbyService.initCon();
    this.lobbyService.createLobby();
  }
}
