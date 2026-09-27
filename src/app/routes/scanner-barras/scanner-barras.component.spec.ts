import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { ScannerBarrasComponent } from './scanner-barras.component';
import { SocketService } from '../services/sockets.service';
import { socketServiceStub, toastrServiceStub } from '../services/test-stubs';

describe('ScannerBarrasComponent', () => {
  let component: ScannerBarrasComponent;
  let fixture: ComponentFixture<ScannerBarrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerBarrasComponent],
      providers: [
        { provide: SocketService, useValue: socketServiceStub },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerBarrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});