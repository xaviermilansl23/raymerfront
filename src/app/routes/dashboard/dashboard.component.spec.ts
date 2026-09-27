import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../services/auth.service';
import {
  activatedRouteStub,
  authServiceStub,
  breakpointObserverStub,
  matDialogStub,
  routerStub,
  toastrServiceStub,
} from '../services/test-stubs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: BreakpointObserver, useValue: breakpointObserverStub },
        { provide: MatDialog, useValue: matDialogStub },
        { provide: ToastrService, useValue: toastrServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra Smart Sales solo a gerentes y superadmins', () => {
    const smartSales = component.menuItems.find((item) => item.label === 'Smart Sales');
    expect(smartSales).toBeDefined();
    const roles = spyOn(component, 'getRoles');

    roles.and.returnValue(['VENDEDOR']);
    expect(component.puedeVer(smartSales!)).toBeFalse();

    roles.and.returnValue(['GERENTE']);
    expect(component.puedeVer(smartSales!)).toBeTrue();

    roles.and.returnValue(['SUPERADMIN']);
    expect(component.puedeVer(smartSales!)).toBeTrue();
  });
});
