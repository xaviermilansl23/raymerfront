import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionDialgLotesComponent } from './confirmacion-dialg-lotes.component';

describe('ConfirmacionDialgLotesComponent', () => {
  let component: ConfirmacionDialgLotesComponent;
  let fixture: ComponentFixture<ConfirmacionDialgLotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionDialgLotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmacionDialgLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
