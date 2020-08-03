import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.scss'],
})
export class CreateLobbyComponent implements OnInit {
  create: boolean = false;
  name: string = '';
  constructor() {}

  ngOnInit() {}

  addNew(event) {
    this.create = true;
  }

  cancel(event) {
    this.create = false;
  }

  onKey(value: string) {
    this.name = value;
  }
}
