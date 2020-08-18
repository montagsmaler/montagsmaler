import { Component, OnInit } from '@angular/core';
import { AuthService } from './api/http/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'montagsmaler-frontend';

  constructor() { }

  ngOnInit(): void {

  }
}
