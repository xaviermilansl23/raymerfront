import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmarEliminarDialogComponent } from './confirmar-eliminar-dialog.component';
import { dialogRefStub, matDialogDataStub } from '../../services/test-stubs';

describe('ConfirmarEliminarDialogComponent', () => {
  let component: ConfirmarEliminarDialogComponent;
  let fixture: ComponentFixture<ConfirmarEliminarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarEliminarDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmarEliminarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});