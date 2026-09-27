import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DateAdapter } from '@angular/material/core';
import { NEVER, of, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FreshService, UsuarioReporte } from '../../services/fresh.service';
import { ConfSisComponent } from './conf-sis.component';

describe('ConfSisComponent', () => {
  let service: jasmine.SpyObj<FreshService>;
  const usuario: UsuarioReporte = { usuario_id: 31, nombre: 'Paolo Milan', usuario: 'paolo', ci: '11109981' };
  beforeEach(async () => {
    service = jasmine.createSpyObj<FreshService>('FreshService', ['obtenerInfoSistema', 'buscarUsuariosReporte', 'buscarVendedoresConVentas', 'generarReporteVentas']);
    service.obtenerInfoSistema.and.returnValue(of({ nombre_empresa: 'RAYMER' }));
    service.buscarUsuariosReporte.and.returnValue(of([usuario]));
    service.generarReporteVentas.and.returnValue(NEVER);
    await TestBed.configureTestingModule({
      imports: [ConfSisComponent],
      providers: [provideNoopAnimations(), { provide: FreshService, useValue: service },
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']) }],
    }).compileComponents();
  });
  const create = () => { const f = TestBed.createComponent(ConfSisComponent); f.detectChanges(); return f; };

  it('estabiliza la vista sin ciclos de ngModel ni búsquedas al abrir', fakeAsync(() => {
    const f = create(), c = f.componentInstance;
    const fecha = c.fechas.controls.inicio.value;
    for (let i = 0; i < 5; i++) { tick(300); f.detectChanges(); }
    expect(c.fechas.controls.inicio.value).toBe(fecha);
    expect(c.cargandoInfo).toBeFalse();
    expect(c.fechaFin).toBe(c.fechaMaxima);
    expect(c.fechaInicio >= '2022-01-01').toBeTrue();
    expect(service.obtenerInfoSistema).toHaveBeenCalledTimes(1);
    expect(service.buscarUsuariosReporte).not.toHaveBeenCalled();
    expect(service.buscarVendedoresConVentas).not.toHaveBeenCalled();
    f.destroy();
  }));

  it('muestra y admite dd/mm/aaaa, rechazando fechas inexistentes', fakeAsync(() => {
    const f = create(), c = f.componentInstance;
    c.fechas.setValue({ inicio: new Date(2022, 0, 5), fin: new Date(2022, 1, 20) }); f.detectChanges();
    const input: HTMLInputElement = f.nativeElement.querySelector('[formControlName="inicio"]');
    expect(input.value).toBe('05/01/2022');
    input.value = '03/02/2022'; input.dispatchEvent(new Event('input')); f.detectChanges();
    expect(c.fechaInicio).toBe('2022-02-03');
    input.value = '31/02/2022'; input.dispatchEvent(new Event('input')); f.detectChanges();
    expect(c.fechas.controls.inicio.invalid).toBeTrue();
    const adapter = f.debugElement.injector.get(DateAdapter);
    expect(adapter.isValid(adapter.parse('12/31/2022', null)!)).toBeFalse();
    expect(adapter.isValid(adapter.parse('29/02/2024', null)!)).toBeTrue();
    f.destroy();
  }));

  it('consulta solo usuarios después de dos caracteres y una pausa', fakeAsync(() => {
    const f = create(), c = f.componentInstance;
    c.vendedorControl.setValue('P'); tick(300);
    expect(service.buscarUsuariosReporte).not.toHaveBeenCalled();
    c.vendedorControl.setValue('Pa'); tick(100);
    c.vendedorControl.setValue('Paolo'); tick(249);
    expect(service.buscarUsuariosReporte).not.toHaveBeenCalled(); tick(1);
    expect(service.buscarUsuariosReporte).toHaveBeenCalledOnceWith('Paolo');
    expect(c.vendedoresSugeridos).toEqual([usuario]);
    expect(f.nativeElement.textContent).not.toContain('Total vendido');
    expect(service.buscarVendedoresConVentas).not.toHaveBeenCalled();
    f.destroy();
  }));

  it('cancela respuestas antiguas al editar y deshabilita inmediatamente el PDF', fakeAsync(() => {
    const respuesta = new Subject<UsuarioReporte[]>(); service.buscarUsuariosReporte.and.returnValue(respuesta);
    const f = create(), c = f.componentInstance;
    c.vendedorControl.setValue('Paolo'); tick(250); expect(respuesta.observed).toBeTrue();
    c.vendedorControl.setValue('Maria'); expect(respuesta.observed).toBeFalse();
    c.vendedorControl.setValue(usuario); c.seleccionarVendedor({ option: { value: usuario } } as any);
    expect(c.puedeGenerar).toBeTrue();
    c.vendedorControl.setValue('Otra persona'); expect(c.puedeGenerar).toBeFalse();
    f.destroy();
  }));

  it('conserva el usuario al cambiar fechas y envía el rango ISO al PDF', fakeAsync(() => {
    const f = create(), c = f.componentInstance;
    c.vendedorControl.setValue(usuario); c.seleccionarVendedor({ option: { value: usuario } } as any);
    c.fechas.setValue({ inicio: new Date(2022, 0, 1), fin: new Date(2022, 0, 31) }); f.detectChanges(); tick(300);
    expect(c.vendedorSeleccionado).toBe(usuario); expect(service.buscarUsuariosReporte).not.toHaveBeenCalled();
    c.generarReporte(); c.generarReporte();
    expect(service.generarReporteVentas).toHaveBeenCalledOnceWith('2022-01-01', '2022-01-31', 31);
    f.destroy();
  }));

  it('impide generar con rangos invertidos o fechas futuras', fakeAsync(() => {
    const f = create(), c = f.componentInstance; c.vendedorSeleccionado = usuario;
    for (const [inicio, fin] of [[new Date(2022, 2, 1), new Date(2022, 1, 1)], [new Date(2022, 0, 1), new Date(2999, 0, 1)]]) {
      c.fechas.setValue({ inicio, fin }); f.detectChanges(); expect(c.puedeGenerar).toBeFalse(); c.generarReporte();
    }
    expect(service.generarReporteVentas).not.toHaveBeenCalled(); f.destroy();
  }));

  it('termina la espera y permite reintentar si la información no responde', fakeAsync(() => {
    service.obtenerInfoSistema.and.returnValue(NEVER);
    const f = create(), c = f.componentInstance;
    tick(15000); f.detectChanges(); expect(c.cargandoInfo).toBeFalse();
    expect(f.nativeElement.textContent).toContain('Reintentar');
    service.obtenerInfoSistema.and.returnValue(of({ nombre_empresa: 'RAYMER' }));
    c.cargarInfoSistema(); f.detectChanges();
    expect(c.errorInfo).toBeFalse(); expect(f.nativeElement.textContent).toContain('RAYMER'); f.destroy();
  }));

  it('termina búsquedas sin respuesta y cancela peticiones al salir', fakeAsync(() => {
    service.buscarUsuariosReporte.and.returnValue(NEVER);
    const info = new Subject(); service.obtenerInfoSistema.and.returnValue(info);
    const f = create(), c = f.componentInstance;
    c.vendedorControl.setValue('Paolo'); tick(15250);
    expect(c.cargandoVendedores).toBeFalse(); expect(c.errorVendedores).toBeTrue();
    c.cargarInfoSistema(); expect(info.observed).toBeTrue(); f.destroy(); expect(info.observed).toBeFalse();
  }));
});
