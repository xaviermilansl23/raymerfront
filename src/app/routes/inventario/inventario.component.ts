// src/app/routes/inventario/inventario.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { crearPaginadorProductos } from '../../shared/productos-paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { CategoriasComponent } from './categorias/categorias.component';
import { DialogcategoriasComponent } from './categorias/dialogcategorias/dialogcategorias.component';
import { DialogProductoComponent } from './dialog-producto/dialog-producto.component';
import { DetalleProductoComponent } from './detalle-producto/detalle-producto.component';
import { FiltrosProductoDialogComponent } from './filtros-producto-dialog/filtros-producto-dialog.component';
import { FreshService } from '../services/fresh.service';
import { environment } from '../../../environments/environment';

type Vista = 'categorias' | 'formulario' | 'producto' | 'detalle-producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
    CategoriasComponent,
    DialogcategoriasComponent,
    DialogProductoComponent,
    DetalleProductoComponent,
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useFactory: crearPaginadorProductos }],
})
export class InventarioComponent {
  @ViewChild('sideNav') sideNav!: MatSidenav;
  @ViewChild('listadoProductos') listadoProductos?: ElementRef<HTMLElement>;

  currentView: Vista = 'categorias';

  selectedProduct: any = null;
  selectedProductId: number | null = null;

  productos: any[] = [];
  productosFiltrados: any[] = [];
  paginaProductos = 0;
  productosPorPagina = 30;

  get productosPagina(): any[] {
    const inicio = this.paginaProductos * this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.productosPorPagina);
  }

  cambiarPaginaProductos(event: PageEvent): void {
    this.paginaProductos = event.pageIndex;
    this.productosPorPagina = event.pageSize;
    this.listadoProductos?.nativeElement.scrollIntoView({ block: 'start' });
  }

  baseUrl: string = environment.apiUrl;

  filtroNombre: string = '';
  filtroTipos: number[] = [];
  tiposDeProductos: Array<{
    tipo_producto_id: number;
    tipo_producto_nombre: string;
  }> = [];

  debeActualizarListado = false;

  constructor(
    private router: Router,
    private productosService: FreshService,
    private dialog: MatDialog,
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
    return (rows || []).reduce(
      (acc, r) => {
        const id = Number(r.producto_id);
        if (id) acc[id] = r;
        return acc;
      },
      {} as Record<number, any>,
    );
  }

  /** Carga productos y luego mezcla con FIFO (stock_disponible, precio_fifo, precio_venta del lote reciente) */
  actualizarListado(): void {
    this.productosService.listarProductos().subscribe({
      next: async (data) => {
        let base = data.map((p: any) => this.mapProducto(p));

        // 🚀 Trae todos los FIFO de una: GET /lotes/calcular-fifo
        try {
          const fifoRows = await firstValueFrom(
            this.productosService.calcularFIFO(),
          );
          const fifoIdx = this.indexByProductoId(fifoRows);

          // Mezclar: si hay datos FIFO para el producto, los inyectamos
          base = base.map((p: any) => {
            const pid = Number(p.producto_id ?? p.id); // por si tu API usa "id"
            const fifo = fifoIdx[pid];
            return {
              ...p,
              // estos 3 campos vienen del SP nuevo
              stock_disponible: this.num(
                fifo?.stock_disponible,
                p.stock_disponible ?? 0,
              ),
              precio_fifo: this.num(fifo?.precio_fifo, p.precio_fifo ?? 0),
              // opcional: si quieres usar el precio_venta del último lote
              precio_venta: this.num(
                fifo?.precio_venta,
                p.precio_venta ?? p.precio ?? 0,
              ),
            };
          });
        } catch (fifoErr) {
          // Si falla el FIFO, mostramos la lista base sin stock/precios FIFO
          console.warn(
            'Error al mezclar FIFO, se muestra lista base:',
            fifoErr,
          );
        }

        this.productos = base;
        this.aplicarFiltros();
        this.cargarTipos();
      },
      error: (err) => console.error('Error al obtener productos:', err),
    });
  }

  /** Carga las categorías desde /tipo-producto (traen nombre). Si falla,
   *  deriva los tipos desde el listado de productos. */
  private cargarTipos(): void {
    this.productosService.listarTipoproductos().subscribe({
      next: (response: any) => {
        const arr = Array.isArray(response)
          ? response
          : (response?.result ?? []);
        const tipos = (arr as any[])
          .map((t) => ({
            tipo_producto_id: Number(t.tipo_producto_id ?? t.id ?? 0),
            tipo_producto_nombre: (t.tipo_producto_nombre ?? t.nombre ?? '')
              .toString()
              .trim(),
          }))
          .filter(
            (x) => x.tipo_producto_id > 0 && x.tipo_producto_nombre.length > 0,
          )
          .sort((a, b) =>
            a.tipo_producto_nombre.localeCompare(b.tipo_producto_nombre),
          );
        this.tiposDeProductos =
          tipos.length > 0 ? tipos : this.getTiposUnicos();
      },
      error: () => {
        this.tiposDeProductos = this.getTiposUnicos();
      },
    });
  }

  getTiposUnicos(): Array<{
    tipo_producto_id: number;
    tipo_producto_nombre: string;
  }> {
    const tiposMap = new Map<number, string>();
    this.productos.forEach((producto) => {
      const id = Number(producto.tipo_producto_id ?? 0);
      const nombre = producto.tipo_producto_nombre ?? '';
      if (id && !tiposMap.has(id)) tiposMap.set(id, nombre);
    });
    return Array.from(tiposMap, ([id, nombre]) => ({
      tipo_producto_id: id,
      tipo_producto_nombre: nombre,
    }));
  }

  aplicarFiltros(): void {
    this.paginaProductos = 0;
    const nombreFiltro = this.filtroNombre.trim().toLowerCase();
    const tiposFiltro = this.filtroTipos;

    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideNombre = nombreFiltro
        ? [producto.nombre, producto.marca, producto.modelo].some((valor) =>
            String(valor || '')
              .toLowerCase()
              .includes(nombreFiltro),
          )
        : true;
      const coincideTipo =
        tiposFiltro.length > 0
          ? tiposFiltro.includes(Number(producto.tipo_producto_id))
          : true;
      return coincideNombre && coincideTipo;
    });
  }

  abrirFiltros(): void {
    const ref = this.dialog.open(FiltrosProductoDialogComponent, {
      width: 'min(520px, 94vw)',
      data: {
        tipos: this.tiposDeProductos,
        seleccion: [...this.filtroTipos],
      },
    });

    ref.afterClosed().subscribe((resultado: number[] | undefined) => {
      if (!resultado) return; // Se canceló: se conservan los filtros actuales
      this.filtroTipos = resultado;
      this.aplicarFiltros();
    });
  }

  quitarFiltroTipo(id: number): void {
    if (!this.filtroTipos.includes(id)) return;
    this.filtroTipos = this.filtroTipos.filter((t) => t !== id);
    this.aplicarFiltros();
  }

  nombreTipo(id: number): string {
    const tipo = this.tiposDeProductos.find((t) => t.tipo_producto_id === id);
    return tipo?.tipo_producto_nombre ?? `Tipo ${id}`;
  }

  get filtrosActivos(): boolean {
    return this.filtroNombre.trim().length > 0 || this.filtroTipos.length > 0;
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroTipos = [];
    this.aplicarFiltros();
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

  async openProductoFormulario(
    productoId: number | null = null,
  ): Promise<void> {
    if (productoId) {
      try {
        const data = await firstValueFrom(
          this.productosService.listarProductoPorId(productoId),
        );
        this.selectedProduct = Array.isArray(data) ? data[0] : data;
        if (!this.selectedProduct?.producto_id) {
          this.selectedProduct = {
            ...this.selectedProduct,
            producto_id: productoId,
          };
        }
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
      this.filtroTipos = [];
      this.debeActualizarListado = false;
    }
  }

  // ===== Adiciones de presentación (no alteran la lógica funcional) =====
  get totalConStock(): number {
    return this.productos.filter((p) => this.num(p.stock_disponible) > 0)
      .length;
  }

  get totalSinStock(): number {
    return this.productos.filter((p) => this.num(p.stock_disponible) <= 0)
      .length;
  }

  get unidadesTotales(): number {
    return this.productos.reduce(
      (acc, p) => acc + this.num(p.stock_disponible),
      0,
    );
  }

  get maxStock(): number {
    return this.productosFiltrados.reduce(
      (acc, p) => Math.max(acc, this.num(p.stock_disponible)),
      0,
    );
  }

  /** Porcentaje visual de stock para la barra de la tarjeta */
  stockPct(producto: any): number {
    const s = this.num(producto.stock_disponible);
    if (s <= 0 || this.maxStock <= 0) return 0;
    return Math.max(6, Math.min(100, (s / this.maxStock) * 100));
  }
}
