import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { DiaologUsuariosComponent } from './diaolog-usuarios.component';
import { FreshService } from '../../services/fresh.service';
import {
  dialogRefStub,
  freshServiceStub,
  matDialogDataStub,
  toastrServiceStub,
} from '../../services/test-stubs';

describe('DiaologUsuariosComponent', () => {
  let component: DiaologUsuariosComponent;
  let fixture: ComponentFixture<DiaologUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaologUsuariosComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataStub },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiaologUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});