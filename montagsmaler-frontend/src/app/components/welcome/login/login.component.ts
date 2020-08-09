import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService, ILoginRequest } from 'src/app/api/http/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() stateChanges = new EventEmitter();

  loginForm;

  constructor(
    private formBuilder: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.loginForm = this.formBuilder.group({
      name: '',
      password: ''
    });
  }

  ngOnInit() {
    this.authService.getLoggedInUser$().subscribe(console.log);
    this.authService.getCognitoUser().then(console.log).catch(console.warn);
    this.authService.getCognitoUser().then(console.log).catch(console.warn);
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
}
