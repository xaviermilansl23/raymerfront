import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { DialogLotesComponent } from './dialog-lotes.component';
import { FreshService } from '../../../services/fresh.service';
import {
  dialogRefStub,
  freshServiceStub,
  matDialogDataStub,
  toastrServiceStub,
} from '../../../services/test-stubs';

describe('DialogLotesComponent', () => {
  let component: DialogLotesComponent;
  let fixture: ComponentFixture<DialogLotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogLotesComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataStub },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
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