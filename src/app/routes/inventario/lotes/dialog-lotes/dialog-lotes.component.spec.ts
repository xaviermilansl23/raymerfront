import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLotesComponent } from './dialog-lotes.component';

describe('DialogLotesComponent', () => {
  let component: DialogLotesComponent;
  let fixture: ComponentFixture<DialogLotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogLotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
