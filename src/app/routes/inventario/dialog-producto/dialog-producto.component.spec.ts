import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { DialogProductoComponent } from './dialog-producto.component';
import { FreshService } from '../../services/fresh.service';
import { freshServiceStub, toastrServiceStub } from '../../services/test-stubs';

describe('DialogProductoComponent', () => {
  let component: DialogProductoComponent;
  let fixture: ComponentFixture<DialogProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProductoComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: ToastrService, useValue: toastrServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});