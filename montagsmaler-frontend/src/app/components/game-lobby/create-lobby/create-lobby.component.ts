import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-create-lobby",
  templateUrl: "./create-lobby.component.html",
  styleUrls: ["./create-lobby.component.scss"],
})
export class CreateLobbyComponent implements OnInit {
  create: boolean = false;
  constructor() {
  }

  ngOnInit() {}

  public addNew(event) {
    this.create = true;
  }

  public cancel(event) {
    this.create = false;
  }
}
