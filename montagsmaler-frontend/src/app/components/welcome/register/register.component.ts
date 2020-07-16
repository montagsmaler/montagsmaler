import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  @Output() stateChanges = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  switch() {
    this.stateChanges.emit(true);
  }
}
