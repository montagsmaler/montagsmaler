import { Component, OnInit } from '@angular/core';
import { AuthService } from './api/http/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'montagsmaler-frontend';

  constructor(private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getCognitoUser().then(console.log).catch(console.warn);
  }
}
