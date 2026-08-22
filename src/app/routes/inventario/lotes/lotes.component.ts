import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { DialogLotesComponent } from './dialog-lotes/dialog-lotes.component';
import { ConfirmacionDialgLotesComponent } from './confirmacion-dialg-lotes/confirmacion-dialg-lotes.component';
import { FreshService } from '../../services/fresh.service';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.scss'],
})
export class LotesComponent implements OnInit, AfterViewInit, OnDestroy {
  productoId!: number;
  nombreProducto = '';

  // Tabla Lotes
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'correlativo',
    'codigo_lote',
    'codigo_barras',
    'precio_compra',
    'precio_venta',
    'cantidad',
    'fecha_ingreso',
    'fecha_vencimiento',
    'acciones',
  ];

  // Tabla Stock Inicial/Actual
  stockDataSource = new MatTableDataSource<any>([]);
  stockDisplayedColumns: string[] = [
    'correlativo',
    'producto',
    'codigo_barras',
    'stock_inicial',
    'cantidad',
    'fecha_ingreso',
    'estado',
  ];

  // ViewChild
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('stockPaginator') stockPaginator!: MatPaginator;

  // Filtros stock
  filtroEstado: string = 'A';
  filtroFechaInicio?: Date;
  filtroFechaFin?: Date;

  // Otros
  ultimoLote: any = null;
  private routeSub: any;

  constructor(
    private route: ActivatedRoute,
    private productosService: FreshService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Cargar productoId desde la ruta y refrescar todo
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('productoId');
      if (id) {
        this.productoId = Number(id);
        this.obtenerProducto();
        this.obtenerLotes();
        this.obtenerStockInicial();
        this.obtenerUltimoLote();
      }
    });

    // Predicados de filtro (incluye números/fechas como string)
    this.dataSource.filterPredicate = (row, filter) => this.rowMatchesFilter(row, filter);
    this.stockDataSource.filterPredicate = (row, filter) => this.rowMatchesFilter(row, filter);
  }

  ngAfterViewInit(): void {
    // Asignar paginator y sort una vez montados
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
    if (this.stockPaginator) this.stockDataSource.paginator = this.stockPaginator;
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  /** Filtro texto general para MatTableDataSource (convierte todos los campos a string) */
  private rowMatchesFilter(row: any, filter: string): boolean {
    const f = filter.trim().toLowerCase();
    if (!f) return true;

    const safe = (v: any) =>
      v === null || v === undefined
        ? ''
        : (typeof v === 'string' ? v : String(v)).toLowerCase();

    // Concatena columnas relevantes
    const blob =
      safe(row.correlativo) +
      safe(row.codigo_lote) +
      safe(row.codigo_barras) +
      safe(row.producto) +
      safe(row.precio_compra) +
      safe(row.precio_venta) +
      safe(row.cantidad) +
      safe(row.stock_inicial) +
      safe(row.estado) +
      safe(row.fecha_ingreso) +
      safe(row.fecha_vencimiento);

    return blob.includes(f);
  }

  // ======= Cargas =======

  obtenerProducto(): void {
    this.productosService.listarProductoPorId(this.productoId).subscribe({
      next: (response: any) => {
        const item = Array.isArray(response) ? response[0] : response;
        if (item?.nombre) {
          this.nombreProducto = item.nombre;
        } else {
          this.nombreProducto = '';
          console.warn('No se encontró el producto.');
        }
      },
      error: (err) => console.error('Error al obtener el producto:', err),
    });
  }

  obtenerLotes(): void {
    // Tu servicio debería envolver GET /lotes?productoId=...
    this.productosService.listarLotesById(this.productoId).subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response) ? response : [];
        this.dataSource.data = rows;
        // reset paginador
        if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
      },
      error: (err) => console.error('Error al obtener los lotes:', err),
    });
  }

  obtenerUltimoLote(): void {
    this.productosService.listarultimoLotesById(this.productoId).subscribe({
      next: (response: any) => (this.ultimoLote = response ?? null),
      error: (err) => console.error('Error al obtener el último lote:', err),
    });
  }

  obtenerStockInicial(): void {
    const filtros: any = {
      productoId: this.productoId,
      estado: this.filtroEstado || null,
      fechaInicio: this.filtroFechaInicio ? this.toISO(this.filtroFechaInicio) : null,
      fechaFin: this.filtroFechaFin ? this.toISO(this.filtroFechaFin) : null,
    };

    this.productosService.ListarLotesStock(filtros).subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response) ? response : [];
        this.stockDataSource.data = rows;
        if (this.stockDataSource.paginator) this.stockDataSource.paginator.firstPage();
      },
      error: (err) => console.error('Error al obtener el stock inicial:', err),
    });
  }

  // ======= Utilidades =======

  private toISO(d: Date): string {
    // yyyy-mm-dd (lo que espera el back)
    const pad = (x: number) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  get totalCantidadLotes(): number {
    return this.dataSource.data.reduce((acc, l) => acc + (Number(l.cantidad) || 0), 0);
  }

  // ======= Filtros (tabla lotes) =======

  aplicarFiltro(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  // ======= Filtros (tabla stock) =======

  aplicarFiltroStock(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.stockDataSource.filter = value.trim().toLowerCase();
    if (this.stockDataSource.paginator) this.stockDataSource.paginator.firstPage();
  }

  aplicarFiltrosStock(): void {
    this.obtenerStockInicial();
  }

  limpiarFiltrosStock(): void {
    this.filtroFechaInicio = undefined;
    this.filtroFechaFin = undefined;
    this.filtroEstado = 'A';
    this.stockDataSource.filter = '';
    this.obtenerStockInicial();
  }

  // ======= Diálogos =======

  abrirDialogLotes(): void {
    const dialogRef = this.dialog.open(DialogLotesComponent, {
      width: '500px',
      data: { productoId: this.productoId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.obtenerLotes();
        this.obtenerStockInicial();
        this.obtenerUltimoLote();
      }
    });
  }

  abrirDialogEditarLote(lote: any): void {
    const dialogRef = this.dialog.open(DialogLotesComponent, {
      width: '500px',
      data: { lote },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.obtenerLotes();
        this.obtenerStockInicial();
        this.obtenerUltimoLote();
      }
    });
  }

  abrirDialogConfirmacion(lote: any): void {
    const dialogRef = this.dialog.open(ConfirmacionDialgLotesComponent, {
      width: '400px',
      data: { loteNombre: lote?.codigo_lote },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && lote?.lote_id) {
        this.eliminarLote(lote.lote_id);
      }
    });
  }

  eliminarLote(loteId: number): void {
    this.productosService.eliminarLote(loteId).subscribe({
      next: () => {
        this.toastr.success('Lote eliminado correctamente.', 'Éxito');
        this.obtenerLotes();
        this.obtenerStockInicial();
      },
      error: () => this.toastr.error('Hubo un error al eliminar el lote.', 'Error'),
    });
  }
}
