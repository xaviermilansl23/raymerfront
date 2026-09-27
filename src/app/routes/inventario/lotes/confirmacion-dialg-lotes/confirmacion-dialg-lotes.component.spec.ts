import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmacionDialgLotesComponent } from './confirmacion-dialg-lotes.component';
import { dialogRefStub, matDialogDataStub } from '../../../services/test-stubs';

describe('ConfirmacionDialgLotesComponent', () => {
  let component: ConfirmacionDialgLotesComponent;
  let fixture: ComponentFixture<ConfirmacionDialgLotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionDialgLotesComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataStub },
      ],
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