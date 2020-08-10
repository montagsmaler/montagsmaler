import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitForPlayersComponent } from './wait-for-players.component';

describe('WaitForPlayersComponent', () => {
  let component: WaitForPlayersComponent;
  let fixture: ComponentFixture<WaitForPlayersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitForPlayersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitForPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
