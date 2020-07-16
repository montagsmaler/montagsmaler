import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  @Output() stateChanges = new EventEmitter();

  registerForm;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.registerForm = this.formBuilder.group({
      email: '',
      username: '',
      password: ''
    });
  }

  ngOnInit() {
  }

  switch() {
    this.stateChanges.emit(true);
  }

  onSubmit() {
    this.registerForm.reset();
  }
}
