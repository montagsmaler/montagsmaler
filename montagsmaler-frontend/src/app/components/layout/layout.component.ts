import { Component, OnInit } from '@angular/core';
import { AuthService, User } from 'src/app/api/http/auth';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  User: User;

  constructor(
    private readonly authService: AuthService
    ) { }

  ngOnInit() {
    this.authService.getLoggedInUser$().subscribe(next => {
        console.log(next);
        this.User = next;
    });
    this.authService.getCognitoUser().then(console.log).catch(console.warn);
  }

  logout() {
    this.authService.logout();
  }

}
