import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { HomeComponent } from './home.component';
import { AuthService } from '../services/auth.service';
import { FreshService } from '../services/fresh.service';
import { authServiceStub, routerStub } from '../services/test-stubs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let resumenResponse: Subject<any>;
  let obtenerResumenVentas: jasmine.Spy;

  beforeEach(async () => {
    resumenResponse = new Subject<any>();
    obtenerResumenVentas = jasmine.createSpy('obtenerResumenVentas')
      .and.returnValue(resumenResponse.asObservable());
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        {
          provide: FreshService,
          useValue: {
            listarEstadoPagoADmin: () => of({ estado_pago: 'ACTIVO' }),
            obtenerResumenVentas,
          },
        },
        { provide: Router, useValue: routerStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra las ventas y omite la tarjeta de gastos', () => {
    expect(obtenerResumenVentas.calls.mostRecent().args[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    resumenResponse.next({
      ventasHoy: { total: 100, cantidad: 1 },
      ventasSemana: { total: 200, cantidad: 2 },
      ventasMes: { total: 300, cantidad: 3 },
      balanceNetoHoy: 80,
      productosTop: [],
    });
    resumenResponse.complete();
    fixture.detectChanges();

    expect(component.resumenCargando).toBeFalse();
    expect(component.ventasHoy.total).toBe(100);
    expect(fixture.nativeElement.textContent).not.toContain('Gastos Hoy');
  });

  it('permite reintentar si falla la carga del resumen', () => {
    spyOn(console, 'error');
    resumenResponse.error(new Error('Servicio no disponible'));
    fixture.detectChanges();

    expect(component.resumenCargando).toBeFalse();
    expect(component.resumenError).toBeTrue();
    obtenerResumenVentas.and.returnValue(of({
      ventasHoy: { total: 100, cantidad: 1 },
      ventasSemana: { total: 200, cantidad: 2 },
      ventasMes: { total: 300, cantidad: 3 },
    }));
    fixture.nativeElement.querySelector('.chip-error').click();
    fixture.detectChanges();

    expect(component.resumenError).toBeFalse();
    expect(component.resumenCargando).toBeFalse();
    expect(component.ventasHoy.total).toBe(100);
  });
});
