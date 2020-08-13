import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService, IVerifyRequest, IVerifyResult } from 'src/app/api/http/auth';
import { welcomeState } from 'src/app/models/welcomeState';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {

  @Output() stateChanges = new EventEmitter();

  confirmationForm: FormGroup;
  confirmationSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private readonly authService: AuthService,
    ) {
      this.confirmationForm = this.formBuilder.group({
        name: '',
        confirmation: ''
      });
    }

  ngOnInit() {
  }


  switch() {
    this.stateChanges.emit(welcomeState.LOGIN);
  }

  async onSubmit(value: IVerifyRequest) {
    try {
      const confirmationResult: IVerifyResult = await this.authService.verify(value);
      this.confirmationSuccess = confirmationResult.SUCCESS;
    } catch (err) {
      // display err
      console.error(err);
    }
  }

}
