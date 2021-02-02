import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBitComponent } from './info-bit.component';

describe('InfoBitComponent', () => {
  let component: InfoBitComponent;
  let fixture: ComponentFixture<InfoBitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoBitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
