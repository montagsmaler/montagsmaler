import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  private loginState = true;

  constructor() { }

  ngOnInit() {
  }

  getLoginState() {
    return this.loginState;
  }

  setLoginState(state: boolean) {
    this.loginState = state;
  }

}
