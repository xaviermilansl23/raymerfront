import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfSisComponent } from './conf-sis.component';

describe('ConfSisComponent', () => {
  let component: ConfSisComponent;
  let fixture: ComponentFixture<ConfSisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfSisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfSisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
