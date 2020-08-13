import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, ILoginRequest } from 'src/app/api/http/auth';
import { welcomeState } from 'src/app/models/welcomeState';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() stateChanges = new EventEmitter();

  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      name: '',
      password: ''
    });
  }

  ngOnInit() {
  }

  switch() {
    this.stateChanges.emit(welcomeState.REGISTER);
  }

  async onSubmit(value: ILoginRequest): Promise<void> {
    try {
      await this.authService.login(value);
      this.router.navigate(['/home']);
    } catch (err) {
      // display err
      console.error(err);
    }
  }

}
