import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { ScannerComponent } from './scanner.component';
import { ScannerSyncService } from './scanner-sync.service';
import { dialogRefStub, toastrServiceStub } from '../../../../services/test-stubs';

describe('ScannerComponent', () => {
  let component: ScannerComponent;
  let fixture: ComponentFixture<ScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerComponent],
      providers: [
        { provide: ScannerSyncService },
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});