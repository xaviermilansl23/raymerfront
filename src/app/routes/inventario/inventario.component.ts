// src/app/routes/inventario/inventario.component.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';
import { CategoriasComponent } from './categorias/categorias.component';
import { DialogcategoriasComponent } from './categorias/dialogcategorias/dialogcategorias.component';
import { DialogProductoComponent } from './dialog-producto/dialog-producto.component';
import { DetalleProductoComponent } from './detalle-producto/detalle-producto.component';
import { FreshService } from '../services/fresh.service';
import { environment } from '../../../environments/environment';

type Vista = 'categorias' | 'formulario' | 'producto' | 'detalle-producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatCardModule,
    CategoriasComponent, DialogcategoriasComponent, DialogProductoComponent, DetalleProductoComponent,
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class InventarioComponent {
  @ViewChild('sideNav') sideNav!: MatSidenav;

  currentView: Vista = 'categorias';

  selectedProduct: any = null;
  selectedProductId: number | null = null;

  productos: any[] = [];
  productosFiltrados: any[] = [];

  baseUrl: string = environment.apiUrl;

  filtroNombre: string = '';
  filtroTipoProducto: string = '';
  tiposDeProductos: Array<{ tipo_producto_id: number; tipo_producto_nombre: string }> = [];

  debeActualizarListado = false;

  constructor(
    private router: Router,
    private productosService: FreshService
  ) {}

  ngOnInit(): void {
    this.actualizarListado();
  }

  /** Convierte null/undefined/string numérica a number */
  private num(v: any, def = 0): number {
    if (v === null || v === undefined) return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  /** Mapea y normaliza campos visuales del producto */
  private mapProducto(producto: any) {
    let imagen = producto.imagen_url;
    if (!imagen) {
      imagen = 'assets/noimg.png';
    } else {
      imagen = `${this.baseUrl}${imagen.startsWith('/') ? imagen.slice(1) : imagen}`;
    }
    return {
      ...producto,
      imagen_url: imagen,
    };
  }

  /** Crea un índice por producto_id para mezclar FIFO rápido */
  private indexByProductoId(rows: any[]): Record<number, any> {
    return (rows || []).reduce((acc, r) => {
      const id = Number(r.producto_id);
      if (id) acc[id] = r;
      return acc;
    }, {} as Record<number, any>);
  }

  /** Carga productos y luego mezcla con FIFO (stock_disponible, precio_fifo, precio_venta del lote reciente) */
  actualizarListado(): void {
    this.productosService.listarProductos().subscribe({
      next: async (data) => {
        const items = Array.isArray(data) ? data : (data?.items ?? []);
        let base = items.map((p: any) => this.mapProducto(p));

        // 🚀 Trae todos los FIFO de una: GET /lotes/calcular-fifo
        const fifoRows = await firstValueFrom(this.productosService.calcularFIFO());
        const fifoIdx = this.indexByProductoId(fifoRows);

        // Mezclar: si hay datos FIFO para el producto, los inyectamos
        base = base.map((p: any) => {
          const pid = Number(p.producto_id ?? p.id); // por si tu API usa "id"
          const fifo = fifoIdx[pid];
          return {
            ...p,
            // estos 3 campos vienen del SP nuevo
            stock_disponible: this.num(fifo?.stock_disponible, p.stock_disponible ?? 0),
            precio_fifo: this.num(fifo?.precio_fifo, p.precio_fifo ?? 0),
            // opcional: si quieres usar el precio_venta del último lote
            precio_venta: this.num(fifo?.precio_venta, p.precio_venta ?? p.precio ?? 0),
          };
        });

        this.productos = base;
        this.productosFiltrados = [...this.productos];
        this.tiposDeProductos = this.getTiposUnicos();
      },
      error: (err) => console.error('Error al obtener productos:', err),
    });
  }

  getTiposUnicos(): Array<{ tipo_producto_id: number; tipo_producto_nombre: string }> {
    const tiposMap = new Map<number, string>();
    this.productos.forEach((producto) => {
      const id = Number(producto.tipo_producto_id ?? 0);
      const nombre = producto.tipo_producto_nombre ?? '';
      if (id && !tiposMap.has(id)) tiposMap.set(id, nombre);
    });
    return Array.from(tiposMap, ([id, nombre]) => ({ tipo_producto_id: id, tipo_producto_nombre: nombre }));
  }

  aplicarFiltros(): void {
    const nombreFiltro = this.filtroNombre.trim().toLowerCase();
    const tipoFiltro = this.filtroTipoProducto ? Number(this.filtroTipoProducto) : null;

    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideNombre = nombreFiltro
        ? String(producto.nombre || '').toLowerCase().includes(nombreFiltro)
        : true;
      const coincideTipo = tipoFiltro
        ? Number(producto.tipo_producto_id) === tipoFiltro
        : true;
      return coincideNombre && coincideTipo;
    });
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroTipoProducto = '';
    this.productosFiltrados = [...this.productos];
  }

  async openCategorias(): Promise<void> {
    this.currentView = 'categorias';
    await this.sideNav.open();
  }

  async openFormulario(producto: any = null): Promise<void> {
    this.selectedProduct = producto;
    await this.sideNav.close();
    setTimeout(() => {
      this.currentView = 'formulario';
      this.sideNav.open();
    }, 0);
  }

  async openProductoFormulario(productoId: number | null = null): Promise<void> {
    if (productoId) {
      try {
        const data = await firstValueFrom(this.productosService.listarProductoPorId(productoId));
        this.selectedProduct = Array.isArray(data) ? data[0] : data;
        if (!this.selectedProduct?.producto_id) {
          this.selectedProduct = { ...this.selectedProduct, producto_id: productoId };
        }
        console.log('🧾 Producto cargado para edición:', this.selectedProduct);
      } catch (e) {
        console.error('Error cargando producto por ID', e);
        this.selectedProduct = null;
      }
    } else {
      this.selectedProduct = null;
    }

    await this.sideNav.close();
    setTimeout(() => {
      this.currentView = 'producto';
      this.sideNav.open();
    }, 0);
  }

  async openProductoDetalle(productoId: number): Promise<void> {
    this.selectedProductId = productoId;
    await this.sideNav.close();
    setTimeout(() => {
      this.currentView = 'detalle-producto';
      this.sideNav.open();
    }, 0);
  }

  onEditarProducto(producto: any): void {
    console.log('🧩 Editando producto:', producto);
    this.selectedProduct = producto;
    this.currentView = 'producto';
    this.sideNav.open();
  }

  async backToCategorias(): Promise<void> {
    this.selectedProductId = null;
    await this.sideNav.close();
    setTimeout(() => {
      this.currentView = 'categorias';
      this.sideNav.open();
    }, 0);
  }

  async ClosePanel(): Promise<void> {
    await this.sideNav.close();
    setTimeout(() => {
      this.currentView = 'categorias';
      this.sideNav.open();
    }, 200);
  }

  handleClosePanel(): void {
    this.debeActualizarListado = true;
    this.currentView = 'categorias';
    this.sideNav.close();
    this.actualizarListado();
  }

  handleSideNavClose(): void {
    if (this.debeActualizarListado) {
      this.actualizarListado();
      this.filtroNombre = '';
      this.filtroTipoProducto = '';
      this.debeActualizarListado = false;
    }
  }
}
