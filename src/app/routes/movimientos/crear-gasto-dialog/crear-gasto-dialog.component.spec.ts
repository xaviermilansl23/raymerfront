import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CrearGastoDialogComponent } from './crear-gasto-dialog.component';
import { FreshService } from '../../services/fresh.service';
import {
  dialogRefStub,
  freshServiceStub,
  matDialogDataStub,
  toastrServiceStub,
} from '../../services/test-stubs';

describe('CrearGastoDialogComponent', () => {
  let component: CrearGastoDialogComponent;
  let fixture: ComponentFixture<CrearGastoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearGastoDialogComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataStub },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearGastoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});