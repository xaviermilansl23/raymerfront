import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { InventarioComponent } from './inventario.component';
import { FreshService } from '../services/fresh.service';
import { freshServiceStub, routerStub } from '../services/test-stubs';

describe('InventarioComponent', () => {
  let component: InventarioComponent;
  let fixture: ComponentFixture<InventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioComponent],
      providers: [
        { provide: FreshService, useValue: freshServiceStub() },
        { provide: Router, useValue: routerStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra hasta 30 productos y permite llegar al último sin perder los filtros', () => {
    component.productos = Array.from({ length: 65 }, (_, i) => ({
      producto_id: i + 1, nombre: `Producto ${i + 1}`,
      marca: i === 64 ? 'Marca final' : 'Marca', stock_disponible: 5,
    }));
    component.aplicarFiltros();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.product-card').length).toBe(30);

    component.cambiarPaginaProductos({ pageIndex: 2, pageSize: 30, length: 65 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.product-card').length).toBe(5);
    expect(component.productosPagina[4].producto_id).toBe(65);

    component.filtroNombre = 'Marca final';
    component.aplicarFiltros();
    fixture.detectChanges();
    expect(component.paginaProductos).toBe(0);
    expect(component.productosPagina.map((p) => p.producto_id)).toEqual([65]);
  });
});
