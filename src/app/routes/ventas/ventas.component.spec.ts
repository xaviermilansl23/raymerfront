import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';

import { VentasComponent } from './ventas.component';
import { FreshService } from '../services/fresh.service';
import { SocketService } from '../services/sockets.service';
import {
  breakpointObserverStub,
  freshServiceStub,
  socketServiceStub,
  toastrServiceStub,
} from '../services/test-stubs';

describe('VentasComponent', () => {
  let component: VentasComponent;
  let fixture: ComponentFixture<VentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: ToastrService, useValue: toastrServiceStub },
        { provide: BreakpointObserver, useValue: breakpointObserverStub },
        { provide: SocketService, useValue: socketServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('combina categoría, marca y modelo del catálogo con el stock disponible', () => {
    (component as any).productosService = {
      listarProductos: () => of([
        { producto_id: 25, nombre: 'Monitor', descripcion: 'Pantalla de alta resolución', tipo_producto_id: 4, tipo_producto_nombre: 'Pantallas', marca: 'Marca', modelo: 'M25' },
        { producto_id: 26, nombre: 'Producto nuevo' },
      ]),
      listarProductosinfo: () => of({ data: [{ producto_id: 25, descripcion: null, stock_disponible: 7, precio_fifo: 950 }] }),
    };
    component.cargarProductos();

    expect(component.productos[0]).toEqual(jasmine.objectContaining({
      tipo_producto_id: 4, tipo_producto_nombre: 'Pantallas', marca: 'Marca', modelo: 'M25',
      total_cantidad: 7, precio_fifo: 950,
    }));
    expect(component.productos[1].total_cantidad).toBe(0);
    component.categoriasSeleccionadas = [4];
    component.filtrarProductos();
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([25]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.product-description').textContent).toContain('Pantalla de alta resolución');
  });

  it('pagina el catálogo y conserva el carrito y su stock entre páginas', () => {
    component.productos = Array.from({ length: 65 }, (_, i) => ({
      producto_id: i + 1, nombre: `Producto ${i + 1}`, codigo_barras: `CB${i + 1}`,
      total_cantidad: 5, stock_original: 5, precio_fifo: 100,
      marca: i === 64 ? 'Marca final' : 'Marca',
    }));
    component.filtrarProductos();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.product-card').length).toBe(30);

    component.ventaId = 1;
    component.cambiarPaginaProductos({ pageIndex: 1, pageSize: 30, length: 65 });
    component.agregarAlCarrito(component.productosPagina[0].producto_id);
    component.cambiarPaginaProductos({ pageIndex: 2, pageSize: 30, length: 65 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.product-card').length).toBe(5);
    expect(component.carrito[0].producto_id).toBe(31);
    expect(component.calcularTotal()).toBe(100);

    component.cambiarPaginaProductos({ pageIndex: 1, pageSize: 30, length: 65 });
    expect(component.productosPagina[0].total_cantidad).toBe(4);
    component.filtroNombre = 'Marca final';
    component.filtrarProductos();
    expect(component.paginaProductos).toBe(0);
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([65]);
    expect(component.carrito[0].cantidad).toBe(1);
  });

  it('combina etiquetas múltiples con la búsqueda por nombre o marca y reinicia la página', () => {
    component.tiposProducto = [{ tipo_producto_id: 1, nombre: 'Pantallas' }, { tipo_producto_id: 2, nombre: 'Teclados' }];
    component.productos = [
      { producto_id: 1, nombre: 'Monitor', marca: 'Samsung', tipo_producto_id: 1 },
      { producto_id: 2, nombre: 'Teclado', marca: 'Samsung', tipo_producto_id: 2 },
      { producto_id: 3, nombre: 'Monitor', marca: 'Otra', tipo_producto_id: 1 },
    ];
    component.filtroNombre = '  SAMSUNG ';
    component.paginaProductos = 2;
    component.alternarCategoria(1);
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([1]);
    expect(component.paginaProductos).toBe(0);
    component.alternarCategoria(2);
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([1, 2]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tag-activo').length).toBe(2);
    component.alternarCategoria(1);
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([2]);
    component.alternarCategoria(null);
    component.filtroNombre = 'monitor';
    component.filtrarProductos();
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([1, 3]);
    component.limpiarFiltros();
    expect(component.productosPagina.length).toBe(3);
  });

  it('abre el mismo filtro de Inventario y aplica categorías solo al confirmar', () => {
    component.tiposProducto = [
      { tipo_producto_id: 1, nombre: 'Pantallas' },
      { tipo_producto_id: 2, nombre: 'Teclados' },
    ];
    component.productos = [
      { producto_id: 1, nombre: 'Monitor', tipo_producto_id: 1 },
      { producto_id: 2, nombre: 'Teclado', tipo_producto_id: 2 },
    ];
    component.filtrarProductos();
    const dialog = (component as any).dialog as MatDialog;
    const open = spyOn(dialog, 'open').and.returnValues(
      { afterClosed: () => of([1]) } as any,
      { afterClosed: () => of(undefined) } as any,
    );
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.btn-filtros') as HTMLButtonElement).click();
    expect(open).toHaveBeenCalled();
    expect(open.calls.mostRecent().args[1]?.data).toEqual({
      tipos: [
        { tipo_producto_id: 1, tipo_producto_nombre: 'Pantallas' },
        { tipo_producto_id: 2, tipo_producto_nombre: 'Teclados' },
      ],
      seleccion: [],
    });
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([1]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tag-activo').length).toBe(1);
    component.abrirFiltros();
    expect(component.categoriasSeleccionadas).toEqual([1]);
    (fixture.nativeElement.querySelector('.tag-quitar') as HTMLButtonElement).click();
    expect(component.categoriasSeleccionadas).toEqual([]);
    expect(component.productosPagina.length).toBe(2);
  });

  it('cancela una venta iniciada, limpia el cobro y recupera el stock', () => {
    const respuesta = new Subject<any>();
    const cancelar = jasmine.createSpy('cancelarVenta').and.returnValue(respuesta);
    (component as any).productosService = { cancelarVenta: cancelar };
    spyOn(component, 'cargarProductos');
    component.ventaId = 12;
    component.productos = [{ producto_id: 1, total_cantidad: 3 }];
    component.carrito = [{ producto_id: 1, cantidad: 2 }];
    component.productosProcesados = true;
    component.pagoAbierto = true;
    component.pagoPayloadPreview = { ventaId: 12 };
    component.cancelarVenta();
    component.cancelarVenta();
    expect(cancelar).toHaveBeenCalledOnceWith(12);
    expect(component.isCancelandoVenta).toBeTrue();
    expect(component.carrito.length).toBe(1);
    respuesta.next({ success: true });
    respuesta.complete();
    expect(component.ventaId).toBeNull();
    expect(component.carrito).toEqual([]);
    expect(component.productos[0].total_cantidad).toBe(5);
    expect(component.productosProcesados).toBeFalse();
    expect(component.pagoAbierto).toBeFalse();
    expect(component.pagoPayloadPreview).toBeNull();
    expect(component.isCancelandoVenta).toBeFalse();
    expect(component.cargarProductos).toHaveBeenCalled();
  });

  it('conserva el carrito si falla la cancelación y permite reintentar', () => {
    const cancelar = jasmine.createSpy('cancelarVenta').and.returnValue(throwError(() => new Error('Sin conexión')));
    (component as any).productosService = { cancelarVenta: cancelar };
    component.ventaId = 12;
    component.carrito = [{ producto_id: 1, cantidad: 2 }];
    component.productos = [{ producto_id: 1, total_cantidad: 3 }];
    component.cancelarVenta();
    expect(component.isCancelandoVenta).toBeFalse();
    expect(component.ventaId).toBe(12);
    expect(component.carrito[0].cantidad).toBe(2);
    expect(component.productos[0].total_cantidad).toBe(3);
    component.cancelarVenta();
    expect(cancelar).toHaveBeenCalledTimes(2);
  });

  it('espera la búsqueda de lotes antes de cobrar o cancelar', () => {
    const lotes = new Subject<any>();
    const cancelar = jasmine.createSpy('cancelarVenta').and.returnValue(of({}));
    (component as any).productosService = { listarLotesById: () => lotes, cancelarVenta: cancelar };
    spyOn(component, 'cargarProductos');
    component.ventaId = 12;
    component.productos = [{ producto_id: 1, nombre: 'Monitor', total_cantidad: 2 }];
    component.agregarAlCarrito(1);
    component.cancelarVenta();
    component.abrirPago();
    expect(cancelar).not.toHaveBeenCalled();
    expect(component.pagoAbierto).toBeFalse();
    lotes.next([{ cantidad: 2, codigo_barras: 'CB1' }]);
    lotes.complete();
    expect(component.carrito.length).toBe(1);
    expect(component.productosPendientes).toBe(0);
    component.cancelarVenta();
    expect(cancelar).toHaveBeenCalledOnceWith(12);
    expect(component.carrito).toEqual([]);
  });

  it('permite cancelar después de fallar el pago y bloquea cambios al carrito procesado', async () => {
    const cancelar = jasmine.createSpy('cancelarVenta').and.returnValue(of({}));
    (component as any).productosService = {
      procesarProductos: () => of({}),
      registrarMetPago: () => throwError(() => new Error('Pago rechazado')),
      cancelarVenta: cancelar,
    };
    spyOn(component, 'cargarProductos');
    component.ventaId = 12;
    component.pagoAbierto = true;
    component.carrito = [{ producto_id: 1, cantidad: 1, precio_fifo: 50, codigo_barras: 'CB1' }];
    component.seleccionarMetodo({ id: 1, nombre: 'EFECTIVO' });
    await component.registrarPagoYConfirmar();
    expect(component.isRegistrandoPago).toBeFalse();
    expect(component.productosProcesados).toBeTrue();
    component.pagoAbierto = false;
    component.restarDelCarrito(component.carrito[0]);
    expect(component.carrito.length).toBe(1);
    component.cancelarVenta();
    expect(cancelar).toHaveBeenCalledOnceWith(12);
  });

  it('reintenta solo la confirmación cuando el pago ya fue registrado', async () => {
    const registrar = jasmine.createSpy('registrarMetPago').and.returnValue(of({}));
    const confirmar = jasmine.createSpy('confirmarVenta').and.returnValues(
      throwError(() => new Error('Error temporal')), of({}));
    const cancelar = jasmine.createSpy('cancelarVenta');
    (component as any).productosService = {
      procesarProductos: () => of({}), registrarMetPago: registrar,
      confirmarVenta: confirmar, cancelarVenta: cancelar,
    };
    component.ventaId = 12;
    component.pagoAbierto = true;
    component.carrito = [{ producto_id: 1, cantidad: 1, precio_fifo: 50, codigo_barras: 'CB1' }];
    component.seleccionarMetodo({ id: 1, nombre: 'EFECTIVO' });
    await component.registrarPagoYConfirmar();
    expect(component.pagoRegistrado).toBeTrue();
    expect(component.isConfirmandoVenta).toBeFalse();
    component.cancelarVenta();
    expect(cancelar).not.toHaveBeenCalled();
    await component.registrarPagoYConfirmar();
    expect(registrar).toHaveBeenCalledTimes(1);
    expect(confirmar).toHaveBeenCalledTimes(2);
    expect(component.ventaId).toBeNull();
    expect(component.ventaCompletadaId).toBe(12);
  });
});
