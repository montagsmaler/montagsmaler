import { Component, OnInit } from '@angular/core';
import { welcomeState } from 'src/app/models/welcomeState';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  private loginState = welcomeState.LOGIN;
  welcomeState = welcomeState;

  constructor() { }

  ngOnInit() {
  }

  getLoginState() {
    return this.loginState;
  }

  setLoginState(state) {
    this.loginState = state;
    console.log(this.getLoginState());
  }

}
