import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { DetalleProductoComponent } from './detalle-producto.component';
import { FreshService } from '../../services/fresh.service';
import {
  freshServiceStub,
  matDialogStub,
  routerStub,
  toastrServiceStub,
} from '../../services/test-stubs';

describe('DetalleProductoComponent', () => {
  let component: DetalleProductoComponent;
  let fixture: ComponentFixture<DetalleProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleProductoComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: MatDialog, useValue: matDialogStub },
        { provide: ToastrService, useValue: toastrServiceStub },
        { provide: Router, useValue: routerStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});