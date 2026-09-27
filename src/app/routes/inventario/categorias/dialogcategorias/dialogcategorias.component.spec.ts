import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { DialogcategoriasComponent } from './dialogcategorias.component';
import { FreshService } from '../../../services/fresh.service';
import { freshServiceStub, matDialogStub, toastrServiceStub } from '../../../services/test-stubs';

describe('DialogcategoriasComponent', () => {
  let component: DialogcategoriasComponent;
  let fixture: ComponentFixture<DialogcategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogcategoriasComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: ToastrService, useValue: toastrServiceStub },
        { provide: MatDialog, useValue: matDialogStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogcategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});