import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FreshService } from './fresh.service';

describe('FreshService: catálogo completo', () => {
  let service: FreshService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FreshService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('solicita la cancelación de la venta activa al servidor', () => {
    service.cancelarVenta(42).subscribe();
    const request = http.expectOne((req) => req.url.endsWith('/ventas/cancelar'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ ventaId: 42 });
    request.flush({ success: true });
  });

  it('recupera las páginas restantes hasta incluir los 65 productos', () => {
    let productos: any[] = [];
    service.listarProductos().subscribe((items) => { productos = items; });

    for (let page = 1; page <= 3; page++) {
      const request = http.expectOne((req) => req.url.endsWith('/productos') && req.params.get('page') === String(page));
      expect(request.request.params.get('limit')).toBe('30');
      const cantidad = page === 3 ? 5 : 30;
      request.flush({
        page, limit: 30, total: 65,
        items: Array.from({ length: cantidad }, (_, i) => ({ producto_id: (page - 1) * 30 + i + 1 })),
      });
    }

    expect(productos.length).toBe(65);
    expect(productos[64].producto_id).toBe(65);
    expect(new Set(productos.map((p) => p.producto_id)).size).toBe(65);
  });

  it('incluye los 25 productos sin limitar el catálogo a 20', () => {
    let productos: any[] = [];
    service.listarProductos().subscribe((items) => { productos = items; });
    http.expectOne((req) => req.url.endsWith('/productos')).flush({
      page: 1, limit: 30, total: 25,
      items: Array.from({ length: 25 }, (_, i) => ({ producto_id: i + 1 })),
    });
    expect(productos.length).toBe(25);
  });
});
