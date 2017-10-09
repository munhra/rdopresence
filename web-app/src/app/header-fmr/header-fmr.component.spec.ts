import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderFmrComponent } from './header-fmr.component';

describe('HeaderFmrComponent', () => {
  let component: HeaderFmrComponent;
  let fixture: ComponentFixture<HeaderFmrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderFmrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderFmrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
