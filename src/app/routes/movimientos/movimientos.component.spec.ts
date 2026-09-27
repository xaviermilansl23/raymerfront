import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { MovimientosComponent } from './movimientos.component';
import { FreshService } from '../services/fresh.service';
import { freshServiceStub, matDialogStub, toastrServiceStub } from '../services/test-stubs';

describe('MovimientosComponent', () => {
  let component: MovimientosComponent;
  let fixture: ComponentFixture<MovimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimientosComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: MatDialog, useValue: matDialogStub },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});