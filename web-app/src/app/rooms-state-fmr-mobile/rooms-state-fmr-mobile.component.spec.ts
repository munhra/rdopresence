import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsStateFmrMobileComponent } from './rooms-state-fmr-mobile.component';

describe('RoomsStateFmrMobileComponent', () => {
  let component: RoomsStateFmrMobileComponent;
  let fixture: ComponentFixture<RoomsStateFmrMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomsStateFmrMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomsStateFmrMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
