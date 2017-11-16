import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseStateFMRComponent } from './house-state-fmr.component';

describe('HouseStateFMRComponent', () => {
  let component: HouseStateFMRComponent;
  let fixture: ComponentFixture<HouseStateFMRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseStateFMRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseStateFMRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
