import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogConfSisComponent } from './dialog-conf-sis.component';

describe('DialogConfSisComponent', () => {
  let component: DialogConfSisComponent;
  let fixture: ComponentFixture<DialogConfSisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogConfSisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogConfSisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
