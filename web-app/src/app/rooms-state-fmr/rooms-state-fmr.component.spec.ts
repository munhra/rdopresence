import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsStateFMRComponent } from './rooms-state-fmr.component';

describe('RoomsStateFMRComponent', () => {
  let component: RoomsStateFMRComponent;
  let fixture: ComponentFixture<RoomsStateFMRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomsStateFMRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomsStateFMRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
