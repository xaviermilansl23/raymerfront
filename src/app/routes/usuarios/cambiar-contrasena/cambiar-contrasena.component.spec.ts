import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CambiarContrasenaComponent } from './cambiar-contrasena.component';
import { FreshService } from '../../services/fresh.service';
import { dialogRefStub, freshServiceStub, toastrServiceStub } from '../../services/test-stubs';

describe('CambiarContrasenaComponent', () => {
  let component: CambiarContrasenaComponent;
  let fixture: ComponentFixture<CambiarContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarContrasenaComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});