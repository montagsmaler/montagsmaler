import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultImageComponent } from './result-image.component';

describe('ResultImageComponent', () => {
  let component: ResultImageComponent;
  let fixture: ComponentFixture<ResultImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
