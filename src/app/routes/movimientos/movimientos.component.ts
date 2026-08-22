import { Component, OnInit, ViewChild } from '@angular/core';
import { FreshService } from '../services/fresh.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { DataSource } from '@angular/cdk/collections';
import { FormsModule } from '@angular/forms';
import { matDatepickerAnimations } from '@angular/material/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCard } from '@angular/material/card';
import { MatCardModule } from '@angular/material/card';
import { CrearGastoDialogComponent } from './crear-gasto-dialog/crear-gasto-dialog.component';
import { ConfirmarEliminarDialogComponent } from './confirmar-eliminar-dialog/confirmar-eliminar-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import {  MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-movimientos',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatPaginator,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule

  ],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss'
})
export class MovimientosComponent {
  displayedColumns: string[] = ['numero','fecha', 'productos', 'montoTotal','metodoPago',  'estado']; // Para ventas
  displayedColumnsGastos: string[] = ['numero','fecha', 'nombre', 'descripcion', 'total', 'acciones'];
  ventas: any[] = [];
  fechaHoy: string = new Date().toISOString().split('T')[0];
  dataSource = new MatTableDataSource<any>(); // 🔹 Inicializamos MatTableDataSource
  vistaActual: 'ventas' | 'gastos' = 'ventas'; // 🔹 Vista por defecto

  fechaInicio: string = ''; // Variable para la fecha de inicio
  fechaFin: string = ''; // Variable para la fecha de fin
  totalBalance: number = 0; // 🔹 Total de todas las ventas completadas
  totalVentas: number = 0; // 🔹 Cantidad de ventas completadas
  totalGastosFiltrados: number = 0;
  balanceNeto: number = 0;
  gastosOriginales: any[] = [];
  datosCargados = false;
  metodosPagoCatalogo: Array<{ id: number; nombre: string; activo: boolean }> = [];
  metodosPagoSeleccionados: number[] = []; // IDs seleccionados en el filtro





  @ViewChild(MatPaginator) paginator!: MatPaginator; // 🔹 Referencia al paginador

  constructor(
    private ventasService: FreshService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,

     ) {}

ngOnInit(): void {

  if (!this.fechaInicio && !this.fechaFin) {
    // 🔹 No se setean fechas visibles al usuario, solo internamente se usa fecha de hoy para la carga del día
    this.fechaHoy = this.obtenerFechaLocal();
    this.obtenerVentasDelDia();
    this.obtenerGastosDelDia();
    this.datosCargados = true;
    this.cdr.detectChanges();
  }
    this.cargarMetodosPago();

}


cargarMetodosPago(): void {
  this.ventasService.listarMetPago().subscribe({
    next: (res) => {
      this.metodosPagoCatalogo = (res || []).filter((m: any) => !!m.activo);
    },
    error: () => {
      this.toastr.error('No se pudieron cargar los métodos de pago', 'Error');
    },
  });
}



   // 🔹 Cambiar entre vistas
  cambiarVista(vista: 'ventas' | 'gastos') {
  this.vistaActual = vista;

  if (this.fechaInicio && this.fechaFin) {
    this.filtrarPorFechas(); // 🔹 Mantiene los filtros si están activos
  } else {
    if (vista === 'ventas') {
      this.obtenerVentasDelDia();
    } else {
      this.obtenerGastosDelDia();
    }
  }
}

public aplicarFiltros() {
  this.filtrarPorFechas();
}


  // 🔹 Obtener gastos sin servicio externo (se almacenan localmente)
  obtenerGastosDelDia(): void {

    this.ventasService.consultarGastoDelDia().subscribe(
      (response) => {

        // 🔹 Guardamos los datos de gastos sin afectar `dataSource`
        this.gastosOriginales = response;

        // 🔹 Calcular total de gastos
        this.totalGastosFiltrados = this.gastosOriginales.reduce((sum: number, gasto: any) => sum + Number(gasto.total), 0);


        // 🔹 Si estamos en la vista de gastos, mostramos estos datos
        if (this.vistaActual === 'gastos') {
          this.dataSource.data = this.gastosOriginales;
        }

        this.calcularBalanceNeto();
      },
      (error) => {
      }
    );
  }


filtrarPorFechas(): void {
  // Normaliza fechas si existen (ventas las toma opcionales)
  const fi = this.fechaInicio ? this.formatFecha(this.fechaInicio) : null;
  const ff = this.fechaFin    ? this.formatFecha(this.fechaFin)    : null;

  // === VENTAS (fechas y métodos opcionales)
  const params: any = {};
  if (fi) params.fechaInicio = fi;
  if (ff) params.fechaFin    = ff;

  const metodos = (this.metodosPagoSeleccionados || [])
    .map((x: any) => Number(x))
    .filter((n: number) => !Number.isNaN(n));
  if (metodos.length) params.metodosPagoIds = metodos;

  this.ventasService.consultarVentas(params).subscribe({
    next: (resp) => {
      this.ventas = resp || [];
      this.totalBalance = this.ventas.reduce((sum: number, v: any) => sum + Number(v.monto_total ?? 0), 0);
      this.totalVentas = this.ventas.length;
      if (this.vistaActual === 'ventas') this.dataSource.data = this.ventas;
      this.calcularBalanceNeto();
    },
    error: (e) => console.error(e)
  });

  // === GASTOS (para actualizar SIEMPRE la tarjeta)
  // Si hay rango de fechas => usa el rango; si no => usa del día
  const gastosObs = (fi && ff)
    ? this.ventasService.consultarGastosPorFecha(fi, ff)
    : this.ventasService.consultarGastoDelDia();

  gastosObs.subscribe({
    next: (resp) => {
      this.gastosOriginales = resp || [];
      this.totalGastosFiltrados = this.gastosOriginales
        .reduce((sum: number, g: any) => sum + Number(g.total ?? 0), 0);
      if (this.vistaActual === 'gastos') this.dataSource.data = this.gastosOriginales;
      this.calcularBalanceNeto();
    },
    error: (e) => console.error(e)
  });

  this.datosCargados = true;
}




  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.metodosPagoSeleccionados = [];


    // 🔹 Cargar Ventas del Día
    this.ventasService.consultarVentasDelDia(this.fechaHoy).subscribe(
      (response) => {
        this.ventas = response.filter((venta: any) => venta.estado_venta !== 'Anulada');
        this.totalBalance = this.ventas.reduce((sum: number, venta: any) => sum + Number(venta.monto_total), 0);
        this.totalVentas = this.ventas.length;

        // 🔹 Si estamos en la vista de ventas, actualizamos la lista
        if (this.vistaActual === 'ventas') {
          this.dataSource.data = this.ventas;
        }

        // 🔹 Recalcular balance neto después de actualizar ambos totales
        this.calcularBalanceNeto();
      },
      (error) => console.error('❌ Error al obtener ventas del día:', error)
    );

    // 🔹 Cargar Gastos del Día
    this.ventasService.consultarGastoDelDia().subscribe(
      (response) => {
        this.gastosOriginales = response;
        this.totalGastosFiltrados = this.gastosOriginales.reduce((sum: number, gasto: any) => sum + Number(gasto.total), 0);

        // 🔹 Si estamos en la vista de gastos, actualizamos la lista
        if (this.vistaActual === 'gastos') {
          this.dataSource.data = this.gastosOriginales;
        }

        // 🔹 Recalcular balance neto después de actualizar ambos totales
        this.calcularBalanceNeto();
      },
      (error) => console.error('❌ Error al obtener gastos del día:', error)
    );
  }





  // 🔹 Función auxiliar para formatear la fecha en 'YYYY-MM-DD'
  convertirFechaAString(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Asegurar 2 dígitos
    const dia = String(fecha.getDate()).padStart(2, '0'); // Asegurar 2 dígitos
    return `${anio}-${mes}-${dia}`;
  }




  abrirDialogoCrearGasto(): void {
    const dialogRef = this.dialog.open(CrearGastoDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerGastosDelDia(); // Recargar lista de gastos después de crear
      }
    });
  }

   // 🔹 Método para abrir el diálogo de edición
   abrirDialogoEditarGasto(gasto: any): void {
    const dialogRef = this.dialog.open(CrearGastoDialogComponent, {
      width: '400px',
      data: gasto, // ✅ Pasamos el gasto como datos al formulario
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerGastosDelDia(); // ✅ Recargar lista después de la edición
      }
    });
  }

// 🔹 Método para abrir el modal de confirmación antes de eliminar
abrirDialogoEliminarGasto(gasto: any): void {
  const dialogRef = this.dialog.open(ConfirmarEliminarDialogComponent, {
    width: '350px',
    data: gasto, // ✅ Pasamos el gasto completo
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.eliminarGasto(gasto.gasto_id); // ✅ Si se confirma, elimina el gasto
    }
  });
}

// 🔹 Método para eliminar un gasto
eliminarGasto(gastoId: number): void {
  this.ventasService.eliminarGasto(gastoId).subscribe(
    () => {
      this.toastr.success('Gasto eliminado correctamente', 'Éxito');
      this.obtenerGastosDelDia(); // ✅ Recargar lista después del borrado
    },
    (error) => {
      this.toastr.error('Error al eliminar el gasto', 'Error');
    }
  );
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; // 🔹 Asigna el paginador después de la vista inicializada
  }
  obtenerFechaLocal(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Mes en formato 2 dígitos
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día en formato 2 dígitos
    return `${anio}-${mes}-${dia}`; // Retorna en formato YYYY-MM-DD
  }

 obtenerVentasDelDia(): void {

  this.ventasService.consultarVentasDelDia(this.fechaHoy).subscribe(
    (response) => {

      this.ventas = response;

      this.totalBalance = this.ventas.reduce((sum: number, venta: any) => sum + Number(venta.monto_total), 0);
      this.totalVentas = this.ventas.length;


      if (this.vistaActual === 'ventas') {
        this.dataSource.data = this.ventas;
      }

      this.calcularBalanceNeto();
    },
    (error) => {
    }
  );
}





  obtenerListaProductos(productos: any[]): string {
    if (!productos || productos.length === 0) {
      return 'Sin productos'; // Si productos es null, undefined o vacío, devolvemos un mensaje
    }
    return productos.map(p => `${p.cantidad} ${p.producto}`).join(', ');
  }



  // 🔹 Función para calcular el balance neto
  calcularBalanceNeto(): void {
    this.balanceNeto = this.totalBalance - this.totalGastosFiltrados;
  }







  // Método para formatear la fecha en YYYY-MM-DD
  formatFecha(fecha: any): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0]; // Obtiene solo la parte YYYY-MM-DD
  }
  // 🔹 Obtener fecha en formato YYYY-MM-DD

}
