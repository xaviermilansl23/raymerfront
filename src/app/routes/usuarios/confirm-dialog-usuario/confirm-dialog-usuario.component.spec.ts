import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmDialogUsuarioComponent } from './confirm-dialog-usuario.component';
import { dialogRefStub, matDialogDataStub } from '../../services/test-stubs';

describe('ConfirmDialogUsuarioComponent', () => {
  let component: ConfirmDialogUsuarioComponent;
  let fixture: ComponentFixture<ConfirmDialogUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogUsuarioComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});