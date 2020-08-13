import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, IRegisterRequest, IRegisterResult } from 'src/app/api/http/auth';
import { welcomeState } from 'src/app/models/welcomeState';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  @Output() stateChanges = new EventEmitter();

  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.registerForm = this.formBuilder.group({
      name: '',
      email: '',
      password: ''
    });
  }

  ngOnInit() {
  }

  switch() {
    this.stateChanges.emit(welcomeState.VERIFY);
  }

  async onSubmit(value: IRegisterRequest) {
    try {
      await this.authService.register(value);
      this.stateChanges.emit(welcomeState.VERIFY);
    } catch (err) {
      // display err
      console.error(err);
    }
  }
}
