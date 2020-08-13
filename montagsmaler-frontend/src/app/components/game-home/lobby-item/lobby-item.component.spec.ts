import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyItemComponent } from './lobby-item.component';

describe('LobbyItemComponent', () => {
  let component: LobbyItemComponent;
  let fixture: ComponentFixture<LobbyItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LobbyItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
