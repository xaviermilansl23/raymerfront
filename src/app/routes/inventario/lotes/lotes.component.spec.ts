import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LotesComponent } from './lotes.component';
import { FreshService } from '../../services/fresh.service';
import {
  activatedRouteStub,
  freshServiceStub,
  matDialogStub,
  toastrServiceStub,
} from '../../services/test-stubs';

describe('LotesComponent', () => {
  let component: LotesComponent;
  let fixture: ComponentFixture<LotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotesComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: MatDialog, useValue: matDialogStub },
        { provide: ToastrService, useValue: toastrServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});